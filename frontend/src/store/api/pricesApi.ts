import { baseApi } from './baseApi';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

export interface PricesResponse {
  [symbol: string]: PriceData;
}

// Real price API integration
export const pricesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTokenPrices: builder.query<PricesResponse, string[]>({
      query: tokens => ({
        url: '/prices',
        params: { tokens: tokens.join(',') },
      }),
      providesTags: ['Prices'],
      // Cache for 30 seconds as per README config
      keepUnusedDataFor: 30,
    }),

    getTokenPrice: builder.query<PriceData, string>({
      query: token => ({
        url: `/prices/${token}`,
      }),
      providesTags: (result, error, token) => [{ type: 'Prices', id: token }],
      keepUnusedDataFor: 30,
    }),

    // CoinGecko integration fallback (if backend is down)
    getCoinGeckoPrices: builder.query<any, string[]>({
      query: tokens => ({
        url: 'https://api.coingecko.com/api/v3/simple/price',
        params: {
          ids: tokens.join(','),
          vs_currencies: 'usd',
          include_24hr_change: 'true',
          include_market_cap: 'true',
          include_24hr_vol: 'true',
        },
      }),
      transformResponse: (response: any): PricesResponse => {
        const transformed: PricesResponse = {};
        Object.entries(response).forEach(([key, value]: [string, any]) => {
          transformed[key] = {
            symbol: key.toUpperCase(),
            price: value.usd || 0,
            change24h: value.usd_24h_change || 0,
            changePercent24h: value.usd_24h_change || 0,
            marketCap: value.usd_market_cap || 0,
            volume24h: value.usd_24h_vol || 0,
            lastUpdated: new Date().toISOString(),
          };
        });
        return transformed;
      },
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useGetTokenPricesQuery,
  useGetTokenPriceQuery,
  useGetCoinGeckoPricesQuery,
} = pricesApi;
