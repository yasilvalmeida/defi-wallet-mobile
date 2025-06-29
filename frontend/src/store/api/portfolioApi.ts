import { baseApi } from './baseApi';
import { Portfolio } from '../../types/portfolio';

export interface PortfolioRequest {
  address: string;
  network: 'solana' | 'ethereum';
}

export interface TokenBalanceRequest {
  address: string;
  token: string;
  network: 'solana' | 'ethereum';
}

export interface TokenBalance {
  balance: string;
  usdValue: number;
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoUri?: string;
  };
}

// Real portfolio API integration
export const portfolioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPortfolio: builder.query<Portfolio, PortfolioRequest>({
      query: ({ address, network }) => ({
        url: `/portfolio/${address}`,
        params: { network },
      }),
      providesTags: (result, error, { address }) => [
        { type: 'Portfolio', id: address },
      ],
      // Cache for 5 minutes as per README config
      keepUnusedDataFor: 300,
      transformErrorResponse: (response) => {
        // Fallback to mock data if backend is unavailable
        if (response.status === 'FETCH_ERROR' || response.status === 404) {
          return {
            error: 'Backend unavailable, using demo data',
            fallback: true,
          };
        }
        return response;
      },
    }),
    
    getTokenBalance: builder.query<TokenBalance, TokenBalanceRequest>({
      query: ({ address, token, network }) => ({
        url: `/portfolio/${address}/balance/${token}`,
        params: { network },
      }),
      providesTags: (result, error, { address, token }) => [
        { type: 'Portfolio', id: `${address}-${token}` },
      ],
      keepUnusedDataFor: 300,
    }),
    
    refreshPortfolio: builder.mutation<Portfolio, PortfolioRequest>({
      query: ({ address, network }) => ({
        url: `/portfolio/${address}/refresh`,
        method: 'POST',
        body: { network },
      }),
      invalidatesTags: (result, error, { address }) => [
        { type: 'Portfolio', id: address },
        'Prices',
      ],
    }),
  }),
});

export const {
  useGetPortfolioQuery,
  useGetTokenBalanceQuery,
  useRefreshPortfolioMutation,
} = portfolioApi;
