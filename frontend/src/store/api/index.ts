import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ENV } from '../../config/env';
import type { Portfolio, Token, TokenPrice, Transaction } from '../../types/portfolio';
import type { SwapQuote, SwapRequest, SwapHistory } from '../../types/swap';
import type { Network } from '../../types/wallet';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: ENV.API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Portfolio', 'Tokens', 'Prices', 'Transactions', 'SwapHistory'],
  endpoints: (builder) => ({
    // Portfolio endpoints
    getPortfolio: builder.query<Portfolio, { address: string; network: Network }>({
      query: ({ address, network }) => `/portfolio/${address}?network=${network}`,
      providesTags: ['Portfolio'],
    }),
    
    getTokenBalance: builder.query<number, { address: string; token: string; network: Network }>({
      query: ({ address, token, network }) => 
        `/portfolio/${address}/balance/${token}?network=${network}`,
      providesTags: ['Portfolio'],
    }),
    
    // Token endpoints
    getTokens: builder.query<Token[], { network: Network }>({
      query: ({ network }) => `/tokens?network=${network}`,
      providesTags: ['Tokens'],
    }),
    
    searchTokens: builder.query<Token[], { query: string; network: Network }>({
      query: ({ query, network }) => `/tokens/search?q=${query}&network=${network}`,
      providesTags: ['Tokens'],
    }),
    
    // Price endpoints
    getTokenPrices: builder.query<TokenPrice[], { tokens: string[] }>({
      query: ({ tokens }) => `/prices?tokens=${tokens.join(',')}`,
      providesTags: ['Prices'],
    }),
    
    getTokenPrice: builder.query<TokenPrice, { token: string }>({
      query: ({ token }) => `/prices/${token}`,
      providesTags: ['Prices'],
    }),
    
    // Transaction endpoints  
    getTransactions: builder.query<Transaction[], { address: string; network: Network; limit?: number }>({
      query: ({ address, network, limit = 50 }) => 
        `/transactions/${address}?network=${network}&limit=${limit}`,
      providesTags: ['Transactions'],
    }),
    
    getTransaction: builder.query<Transaction, { hash: string; network: Network }>({
      query: ({ hash, network }) => `/transactions/hash/${hash}?network=${network}`,
      providesTags: ['Transactions'],
    }),
    
    // Swap endpoints
    getSwapQuote: builder.mutation<SwapQuote, SwapRequest>({
      query: (request) => ({
        url: '/swap/quote',
        method: 'POST',
        body: request,
      }),
    }),
    
    executeSwap: builder.mutation<{ hash: string }, { quote: SwapQuote; userAddress: string }>({
      query: ({ quote, userAddress }) => ({
        url: '/swap/execute',
        method: 'POST',
        body: { quote, userAddress },
      }),
      invalidatesTags: ['Portfolio', 'Transactions'],
    }),
    
    getSwapHistory: builder.query<SwapHistory[], { address: string; network: Network }>({
      query: ({ address, network }) => `/swap/history/${address}?network=${network}`,
      providesTags: ['SwapHistory'],
    }),
    
    // Health check
    healthCheck: builder.query<{ status: string; timestamp: string }, void>({
      query: () => '/health',
    }),
  }),
});

export const {
  useGetPortfolioQuery,
  useGetTokenBalanceQuery,
  useGetTokensQuery,
  useSearchTokensQuery,
  useGetTokenPricesQuery,
  useGetTokenPriceQuery,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useGetSwapQuoteMutation,
  useExecuteSwapMutation,
  useGetSwapHistoryQuery,
  useHealthCheckQuery,
} = api; 