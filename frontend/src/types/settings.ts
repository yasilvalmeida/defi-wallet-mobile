export interface SettingsState {
  // App Preferences
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC' | 'ETH';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh';
  defaultNetwork: 'solana' | 'ethereum';
  
  // Security Settings
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimer: number; // minutes
  pinEnabled: boolean;
  securityWarningsEnabled: boolean;
  
  // Notification Preferences
  pushNotificationsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
  priceAlertsEnabled: boolean;
  portfolioUpdatesEnabled: boolean;
  marketNewsEnabled: boolean;
  
  // Wallet Management
  connectedWallets: ConnectedWallet[];
  customRPCs: CustomRPC[];
  customTokens: CustomToken[];
  
  // Display Preferences
  hideSmallBalances: boolean;
  smallBalanceThreshold: number;
  showTestNetworks: boolean;
  compactMode: boolean;
  
  // Privacy Settings
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  
  // App Info
  appVersion: string;
  buildNumber: string;
  lastUpdated: number;
}

export interface ConnectedWallet {
  id: string;
  name: string;
  type: 'phantom' | 'metamask' | 'walletconnect';
  address: string;
  network: 'solana' | 'ethereum';
  connectedAt: number;
  isActive: boolean;
}

export interface CustomRPC {
  id: string;
  name: string;
  network: 'solana' | 'ethereum';
  url: string;
  chainId?: number;
  isDefault: boolean;
}

export interface CustomToken {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  network: 'solana' | 'ethereum';
  logoUrl?: string;
  addedAt: number;
}

export interface PriceAlert {
  id: string;
  tokenSymbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: number;
}

export interface SettingsUpdateRequest {
  section: keyof SettingsState;
  value: any;
}
