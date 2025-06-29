import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SwapState, SwapRoute, SwapQuoteRequest, Token } from '../../types/swap';
import axios from 'axios';

// Jupiter API endpoints
const JUPITER_API = 'https://quote-api.jup.ag/v6';
const ZEROX_API = 'https://api.0x.org';

// Popular tokens for each network
const SOLANA_TOKENS: Token[] = [
  { address: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', decimals: 9, balance: '12.5456' },
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '399.75' },
  { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether', decimals: 6, balance: '150.25' },
  { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', decimals: 5, balance: '1000000' },
];

const ETHEREUM_TOKENS: Token[] = [
  { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum', decimals: 18, balance: '5.2341' },
  { address: '0xA0b86a33E6441C5871EF3f14A0bf96E5a0b91A4F', symbol: 'USDC', name: 'USD Coin', decimals: 6, balance: '399.75' },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether', decimals: 6, balance: '150.25' },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, balance: '0.0234' },
];

// Async thunk for getting Jupiter quote (Solana)
export const getJupiterQuote = createAsyncThunk(
  'swap/getJupiterQuote',
  async (request: SwapQuoteRequest, { rejectWithValue }) => {
    try {
      // Simulate API call for demo - in real implementation, call Jupiter API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockRoute: SwapRoute = {
        id: 'jupiter-route-1',
        inputAmount: request.amount,
        outputAmount: (parseFloat(request.amount) * 0.95).toString(), // Mock 5% slippage
        priceImpact: 0.12,
        marketInfos: [
          {
            id: 'raydium',
            label: 'Raydium',
            inputMint: request.inputMint,
            outputMint: request.outputMint,
            notEnoughLiquidity: false,
            inAmount: request.amount,
            outAmount: (parseFloat(request.amount) * 0.95).toString(),
            priceImpact: 0.12,
            lpFee: 0.003,
            platformFee: 0.001,
          }
        ],
        protocol: 'jupiter' as const,
        estimatedGas: '0.0001',
        executionTime: 2000,
      };

      return [mockRoute];
    } catch (error) {
      return rejectWithValue('Failed to get Jupiter quote');
    }
  }
);

// Async thunk for getting 0x quote (Ethereum)
export const get0xQuote = createAsyncThunk(
  'swap/get0xQuote',
  async (request: SwapQuoteRequest, { rejectWithValue }) => {
    try {
      // Simulate API call for demo - in real implementation, call 0x API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockRoute: SwapRoute = {
        id: '0x-route-1',
        inputAmount: request.amount,
        outputAmount: (parseFloat(request.amount) * 0.97).toString(), // Mock 3% slippage
        priceImpact: 0.08,
        marketInfos: [
          {
            id: 'uniswap-v3',
            label: 'Uniswap V3',
            inputMint: request.inputMint,
            outputMint: request.outputMint,
            notEnoughLiquidity: false,
            inAmount: request.amount,
            outAmount: (parseFloat(request.amount) * 0.97).toString(),
            priceImpact: 0.08,
            lpFee: 0.003,
            platformFee: 0.0005,
          }
        ],
        protocol: '0x' as const,
        estimatedGas: '0.002',
        executionTime: 1500,
      };

      return [mockRoute];
    } catch (error) {
      return rejectWithValue('Failed to get 0x quote');
    }
  }
);

const initialState: SwapState = {
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  slippage: 0.5, // 0.5%
  isLoading: false,
  error: null,
  routes: [],
  selectedRoute: null,
  priceImpact: 0,
  minimumReceived: '',
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setFromToken: (state, action: PayloadAction<Token>) => {
      state.fromToken = action.payload;
      // Clear routes when tokens change
      state.routes = [];
      state.selectedRoute = null;
      state.toAmount = '';
    },
    setToToken: (state, action: PayloadAction<Token>) => {
      state.toToken = action.payload;
      // Clear routes when tokens change
      state.routes = [];
      state.selectedRoute = null;
      state.toAmount = '';
    },
    setFromAmount: (state, action: PayloadAction<string>) => {
      state.fromAmount = action.payload;
      state.toAmount = '';
      state.routes = [];
      state.selectedRoute = null;
    },
    setSlippage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload;
    },
    swapTokens: (state) => {
      const tempToken = state.fromToken;
      state.fromToken = state.toToken;
      state.toToken = tempToken;
      
      const tempAmount = state.fromAmount;
      state.fromAmount = state.toAmount;
      state.toAmount = tempAmount;
      
      // Clear routes
      state.routes = [];
      state.selectedRoute = null;
    },
    selectRoute: (state, action: PayloadAction<SwapRoute>) => {
      state.selectedRoute = action.payload;
      state.toAmount = action.payload.outputAmount;
      state.priceImpact = action.payload.priceImpact;
      
      // Calculate minimum received with slippage
      const outputAmount = parseFloat(action.payload.outputAmount);
      const slippageMultiplier = (100 - state.slippage) / 100;
      state.minimumReceived = (outputAmount * slippageMultiplier).toFixed(6);
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSwap: (state) => {
      state.fromToken = null;
      state.toToken = null;
      state.fromAmount = '';
      state.toAmount = '';
      state.routes = [];
      state.selectedRoute = null;
      state.error = null;
      state.priceImpact = 0;
      state.minimumReceived = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Jupiter quotes
      .addCase(getJupiterQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getJupiterQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = action.payload;
        if (action.payload.length > 0) {
          state.selectedRoute = action.payload[0];
          state.toAmount = action.payload[0].outputAmount;
          state.priceImpact = action.payload[0].priceImpact;
          
          const outputAmount = parseFloat(action.payload[0].outputAmount);
          const slippageMultiplier = (100 - state.slippage) / 100;
          state.minimumReceived = (outputAmount * slippageMultiplier).toFixed(6);
        }
      })
      .addCase(getJupiterQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 0x quotes
      .addCase(get0xQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(get0xQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = action.payload;
        if (action.payload.length > 0) {
          state.selectedRoute = action.payload[0];
          state.toAmount = action.payload[0].outputAmount;
          state.priceImpact = action.payload[0].priceImpact;
          
          const outputAmount = parseFloat(action.payload[0].outputAmount);
          const slippageMultiplier = (100 - state.slippage) / 100;
          state.minimumReceived = (outputAmount * slippageMultiplier).toFixed(6);
        }
      })
      .addCase(get0xQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFromToken,
  setToToken,
  setFromAmount,
  setSlippage,
  swapTokens,
  selectRoute,
  clearError,
  resetSwap,
} = swapSlice.actions;

export { SOLANA_TOKENS, ETHEREUM_TOKENS };
export default swapSlice.reducer;
