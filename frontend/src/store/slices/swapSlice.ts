import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SwapQuote, SwapHistory, SwapSettings } from '../../types/swap';

interface SwapState {
  currentQuote?: SwapQuote;
  swapHistory: SwapHistory[];
  settings: SwapSettings;
  isLoading: boolean;
  error?: string;
}

const initialState: SwapState = {
  swapHistory: [],
  settings: {
    slippage: 0.5,
    gasPrice: 'standard',
    deadline: 20,
    expertMode: false,
    soundEnabled: true,
  },
  isLoading: false,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setCurrentQuote: (state, action: PayloadAction<SwapQuote | undefined>) => {
      state.currentQuote = action.payload;
      state.error = undefined;
    },
    
    setSwapHistory: (state, action: PayloadAction<SwapHistory[]>) => {
      state.swapHistory = action.payload;
    },
    
    addSwapToHistory: (state, action: PayloadAction<SwapHistory>) => {
      state.swapHistory.unshift(action.payload);
      // Keep only last 50 swaps
      state.swapHistory = state.swapHistory.slice(0, 50);
    },
    
    updateSwapInHistory: (state, action: PayloadAction<{ 
      id: string; 
      updates: Partial<SwapHistory> 
    }>) => {
      const { id, updates } = action.payload;
      const swapIndex = state.swapHistory.findIndex(swap => swap.id === id);
      
      if (swapIndex >= 0) {
        state.swapHistory[swapIndex] = { ...state.swapHistory[swapIndex], ...updates };
      }
    },
    
    updateSettings: (state, action: PayloadAction<Partial<SwapSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = undefined;
    },
    
    clearCurrentQuote: (state) => {
      state.currentQuote = undefined;
    },
  },
});

export const {
  setLoading,
  setCurrentQuote,
  setSwapHistory,
  addSwapToHistory,
  updateSwapInHistory,
  updateSettings,
  setError,
  clearError,
  clearCurrentQuote,
} = swapSlice.actions;

export default swapSlice.reducer; 