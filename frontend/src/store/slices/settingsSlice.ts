import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState, ConnectedWallet, CustomRPC, CustomToken, PriceAlert } from '../../types/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for loading settings from storage
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settingsString = await AsyncStorage.getItem('app_settings');
      if (settingsString) {
        return JSON.parse(settingsString);
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to load settings');
    }
  }
);

// Async thunk for saving settings to storage
export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
      return settings;
    } catch (error) {
      return rejectWithValue('Failed to save settings');
    }
  }
);

// Async thunk for adding custom token
export const addCustomToken = createAsyncThunk(
  'settings/addCustomToken',
  async (token: Omit<CustomToken, 'id' | 'addedAt'>, { rejectWithValue }) => {
    try {
      // Simulate token validation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newToken: CustomToken = {
        ...token,
        id: `custom_${Date.now()}`,
        addedAt: Date.now(),
      };
      
      return newToken;
    } catch (error) {
      return rejectWithValue('Failed to add custom token');
    }
  }
);

// Async thunk for adding custom RPC
export const addCustomRPC = createAsyncThunk(
  'settings/addCustomRPC',
  async (rpc: Omit<CustomRPC, 'id'>, { rejectWithValue }) => {
    try {
      // Simulate RPC validation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newRPC: CustomRPC = {
        ...rpc,
        id: `rpc_${Date.now()}`,
      };
      
      return newRPC;
    } catch (error) {
      return rejectWithValue('Failed to add custom RPC');
    }
  }
);

const initialState: SettingsState = {
  // App Preferences
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  defaultNetwork: 'solana',
  
  // Security Settings
  biometricEnabled: false,
  autoLockEnabled: true,
  autoLockTimer: 5, // 5 minutes
  pinEnabled: false,
  securityWarningsEnabled: true,
  
  // Notification Preferences
  pushNotificationsEnabled: true,
  transactionNotificationsEnabled: true,
  priceAlertsEnabled: false,
  portfolioUpdatesEnabled: true,
  marketNewsEnabled: false,
  
  // Wallet Management
  connectedWallets: [],
  customRPCs: [
    {
      id: 'default_solana',
      name: 'Solana Mainnet (Default)',
      network: 'solana',
      url: 'https://api.mainnet-beta.solana.com',
      isDefault: true,
    },
    {
      id: 'default_ethereum',
      name: 'Ethereum Mainnet (Default)',
      network: 'ethereum',
      url: 'https://mainnet.infura.io/v3/YOUR_KEY',
      chainId: 1,
      isDefault: true,
    },
  ],
  customTokens: [],
  
  // Display Preferences
  hideSmallBalances: false,
  smallBalanceThreshold: 1.0, // $1.00
  showTestNetworks: false,
  compactMode: false,
  
  // Privacy Settings
  analyticsEnabled: true,
  crashReportingEnabled: true,
  
  // App Info
  appVersion: '1.0.0',
  buildNumber: '100',
  lastUpdated: Date.now(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: (state, action: PayloadAction<{ key: keyof SettingsState; value: any }>) => {
      const { key, value } = action.payload;
      (state as any)[key] = value;
      state.lastUpdated = Date.now();
    },
    
    addConnectedWallet: (state, action: PayloadAction<ConnectedWallet>) => {
      state.connectedWallets.push(action.payload);
      state.lastUpdated = Date.now();
    },
    
    removeConnectedWallet: (state, action: PayloadAction<string>) => {
      state.connectedWallets = state.connectedWallets.filter(
        wallet => wallet.id !== action.payload
      );
      state.lastUpdated = Date.now();
    },
    
    updateConnectedWallet: (state, action: PayloadAction<{ id: string; updates: Partial<ConnectedWallet> }>) => {
      const { id, updates } = action.payload;
      const walletIndex = state.connectedWallets.findIndex(wallet => wallet.id === id);
      if (walletIndex !== -1) {
        state.connectedWallets[walletIndex] = {
          ...state.connectedWallets[walletIndex],
          ...updates,
        };
      }
      state.lastUpdated = Date.now();
    },
    
    removeCustomToken: (state, action: PayloadAction<string>) => {
      state.customTokens = state.customTokens.filter(
        token => token.id !== action.payload
      );
      state.lastUpdated = Date.now();
    },
    
    removeCustomRPC: (state, action: PayloadAction<string>) => {
      state.customRPCs = state.customRPCs.filter(
        rpc => rpc.id !== action.payload && !rpc.isDefault
      );
      state.lastUpdated = Date.now();
    },
    
    setDefaultRPC: (state, action: PayloadAction<{ network: 'solana' | 'ethereum'; rpcId: string }>) => {
      const { network, rpcId } = action.payload;
      state.customRPCs.forEach(rpc => {
        if (rpc.network === network) {
          rpc.isDefault = rpc.id === rpcId;
        }
      });
      state.lastUpdated = Date.now();
    },
    
    resetSettings: (state) => {
      // Keep user's connected wallets and custom tokens but reset preferences
      const { connectedWallets, customTokens, customRPCs } = state;
      Object.assign(state, {
        ...initialState,
        connectedWallets,
        customTokens,
        customRPCs,
        lastUpdated: Date.now(),
      });
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      state.lastUpdated = Date.now();
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.fulfilled, (state, action) => {
        if (action.payload) {
          Object.assign(state, action.payload);
        }
      })
      .addCase(loadSettings.rejected, (state, action) => {
        console.error('Failed to load settings:', action.payload);
      })
      
      // Save settings
      .addCase(saveSettings.fulfilled, (state, action) => {
        // Settings saved successfully
      })
      .addCase(saveSettings.rejected, (state, action) => {
        console.error('Failed to save settings:', action.payload);
      })
      
      // Add custom token
      .addCase(addCustomToken.fulfilled, (state, action) => {
        state.customTokens.push(action.payload);
        state.lastUpdated = Date.now();
      })
      .addCase(addCustomToken.rejected, (state, action) => {
        console.error('Failed to add custom token:', action.payload);
      })
      
      // Add custom RPC
      .addCase(addCustomRPC.fulfilled, (state, action) => {
        state.customRPCs.push(action.payload);
        state.lastUpdated = Date.now();
      })
      .addCase(addCustomRPC.rejected, (state, action) => {
        console.error('Failed to add custom RPC:', action.payload);
      });
  },
});

export const {
  updateSetting,
  addConnectedWallet,
  removeConnectedWallet,
  updateConnectedWallet,
  removeCustomToken,
  removeCustomRPC,
  setDefaultRPC,
  resetSettings,
  toggleTheme,
} = settingsSlice.actions;

export default settingsSlice.reducer;
