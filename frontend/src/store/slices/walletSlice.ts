import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WalletState, ConnectWalletResponse } from '../../types/wallet';
import { Linking } from 'react-native';
import { PublicKey } from '@solana/web3.js';

// Phantom Wallet deeplink integration for React Native
const PHANTOM_CONNECT_URL = 'https://phantom.app/ul/browse/https://defi-wallet-mobile.com/connect';

// Async thunk for connecting to Phantom wallet
export const connectPhantomWallet = createAsyncThunk(
  'wallet/connectPhantom',
  async (_, { rejectWithValue }) => {
    try {
      // For React Native, we use deeplinks to connect to Phantom
      // This is a simulation - in real implementation, you'd use Phantom's deeplink protocol
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection for development
      const mockAddress = 'DemoPhantomWallet1234567890abcdef123456789';
      
      return {
        address: mockAddress,
        publicKey: mockAddress,
      } as ConnectWalletResponse;
      
    } catch (error) {
      return rejectWithValue('Failed to connect to Phantom wallet');
    }
  }
);

// Async thunk for disconnecting wallet
export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async () => {
    // Simulate disconnect delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
);

const initialState: WalletState = {
  isConnected: false,
  address: null,
  isConnecting: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.isConnecting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect Phantom Wallet
      .addCase(connectPhantomWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectPhantomWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.error = null;
      })
      .addCase(connectPhantomWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.address = null;
        state.error = action.payload as string;
      })
      // Disconnect Wallet
      .addCase(disconnectWallet.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.isConnected = false;
        state.address = null;
        state.isConnecting = false;
        state.error = null;
      });
  },
});

export const { clearError, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
