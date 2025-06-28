import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
  notifications: {
    enabled: boolean;
    priceAlerts: boolean;
    transactionAlerts: boolean;
    newsAlerts: boolean;
    pushNotifications: boolean;
  };
  security: {
    biometricAuth: boolean;
    autoLock: boolean;
    autoLockTime: number; // minutes
    requireAuthForSend: boolean;
  };
  trading: {
    defaultSlippage: number;
    showTestnets: boolean;
    confirmTransactions: boolean;
    soundEnabled: boolean;
  };
  display: {
    hideSmallBalances: boolean;
    balanceThreshold: number; // USD
    showPercentages: boolean;
    compactMode: boolean;
  };
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  hasHydrated: boolean;
}

const initialState: SettingsState = {
  settings: {
    theme: 'system',
    currency: 'USD',
    language: 'en',
    notifications: {
      enabled: true,
      priceAlerts: true,
      transactionAlerts: true,
      newsAlerts: false,
      pushNotifications: true,
    },
    security: {
      biometricAuth: false,
      autoLock: true,
      autoLockTime: 5,
      requireAuthForSend: true,
    },
    trading: {
      defaultSlippage: 0.5,
      showTestnets: false,
      confirmTransactions: true,
      soundEnabled: true,
    },
    display: {
      hideSmallBalances: false,
      balanceThreshold: 1,
      showPercentages: true,
      compactMode: false,
    },
  },
  isLoading: false,
  hasHydrated: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    updateNotificationSettings: (state, action: PayloadAction<Partial<AppSettings['notifications']>>) => {
      state.settings.notifications = { ...state.settings.notifications, ...action.payload };
    },
    
    updateSecuritySettings: (state, action: PayloadAction<Partial<AppSettings['security']>>) => {
      state.settings.security = { ...state.settings.security, ...action.payload };
    },
    
    updateTradingSettings: (state, action: PayloadAction<Partial<AppSettings['trading']>>) => {
      state.settings.trading = { ...state.settings.trading, ...action.payload };
    },
    
    updateDisplaySettings: (state, action: PayloadAction<Partial<AppSettings['display']>>) => {
      state.settings.display = { ...state.settings.display, ...action.payload };
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.settings.theme = action.payload;
    },
    
    setCurrency: (state, action: PayloadAction<'USD' | 'EUR' | 'GBP' | 'JPY'>) => {
      state.settings.currency = action.payload;
    },
    
    setLanguage: (state, action: PayloadAction<'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh'>) => {
      state.settings.language = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hasHydrated = action.payload;
    },
    
    resetSettings: (state) => {
      state.settings = initialState.settings;
    },
  },
});

export const {
  setSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateTradingSettings,
  updateDisplaySettings,
  setTheme,
  setCurrency,
  setLanguage,
  setLoading,
  setHydrated,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 