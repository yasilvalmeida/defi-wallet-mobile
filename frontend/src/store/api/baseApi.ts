import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  prepareHeaders: headers => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Base API with error handling and retry logic
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Retry logic for failed requests
    if (result.error && 'status' in result.error) {
      const status = result.error.status;
      if (status === 429 || status === 503 || status === 502) {
        // Retry after delay for rate limits or server errors
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await baseQuery(args, api, extraOptions);
      }
    }

    return result;
  },
  tagTypes: [
    'Portfolio',
    'Prices',
    'Transactions',
    'Swap',
    'PriceAlerts',
    'NotificationPreferences',
    'NotificationHistory',
  ],
  endpoints: () => ({}),
});

export default baseApi;
