import { baseApi } from './baseApi';
import { SwapRoute, SwapQuoteRequest } from '../../types/swap';

export interface JupiterQuoteResponse {
  routes: SwapRoute[];
  bestRoute: SwapRoute;
}

export interface ZeroxQuoteResponse {
  routes: SwapRoute[];
  bestRoute: SwapRoute;
}

export interface SwapExecuteRequest {
  route: SwapRoute;
  userAddress: string;
  network: 'solana' | 'ethereum';
}

export interface SwapExecuteResponse {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  estimatedTime: number;
}

// Real swap API integration
export const swapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJupiterQuote: builder.query<JupiterQuoteResponse, SwapQuoteRequest>({
      query: (request) => ({
        url: '/swap/jupiter/quote',
        method: 'POST',
        body: request,
      }),
      providesTags: ['Swap'],
      keepUnusedDataFor: 10, // Quotes expire quickly
      transformErrorResponse: (response) => {
        // Fallback to direct Jupiter API if backend is down
        if (response.status === 'FETCH_ERROR') {
          return {
            error: 'Backend unavailable, trying direct Jupiter API',
            fallback: true,
          };
        }
        return response;
      },
    }),
    
    get0xQuote: builder.query<ZeroxQuoteResponse, SwapQuoteRequest>({
      query: (request) => ({
        url: '/swap/0x/quote',
        method: 'POST',
        body: request,
      }),
      providesTags: ['Swap'],
      keepUnusedDataFor: 10,
    }),
    
    // Direct Jupiter API fallback
    getDirectJupiterQuote: builder.query<any, SwapQuoteRequest>({
      query: ({ inputMint, outputMint, amount, slippageBps }) => ({
        url: 'https://quote-api.jup.ag/v6/quote',
        params: {
          inputMint,
          outputMint,
          amount: Math.floor(parseFloat(amount) * 1e9).toString(), // Convert to lamports
          slippageBps,
        },
      }),
      transformResponse: (response: any): JupiterQuoteResponse => {
        // Transform Jupiter response to our format
        const route: SwapRoute = {
          id: 'jupiter-direct',
          inputAmount: response.inAmount || '0',
          outputAmount: response.outAmount || '0',
          priceImpact: parseFloat(response.priceImpactPct || '0'),
          marketInfos: response.routePlan?.map((step: any) => ({
            id: step.swapInfo?.ammKey || 'unknown',
            label: step.swapInfo?.label || 'Unknown DEX',
            inputMint: step.swapInfo?.inputMint || '',
            outputMint: step.swapInfo?.outputMint || '',
            notEnoughLiquidity: false,
            inAmount: step.swapInfo?.inAmount || '0',
            outAmount: step.swapInfo?.outAmount || '0',
            priceImpact: parseFloat(step.swapInfo?.priceImpactPct || '0'),
            lpFee: parseFloat(step.swapInfo?.feeAmount || '0') / parseFloat(step.swapInfo?.inAmount || '1'),
            platformFee: 0,
          })) || [],
          protocol: 'jupiter',
          estimatedGas: '0.0001',
          executionTime: 2000,
        };
        
        return {
          routes: [route],
          bestRoute: route,
        };
      },
      keepUnusedDataFor: 10,
    }),
    
    executeSwap: builder.mutation<SwapExecuteResponse, SwapExecuteRequest>({
      query: (request) => ({
        url: '/swap/execute',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Portfolio', 'Transactions'],
    }),
  }),
});

export const {
  useGetJupiterQuoteQuery,
  useGet0xQuoteQuery,
  useGetDirectJupiterQuoteQuery,
  useExecuteSwapMutation,
} = swapApi;
