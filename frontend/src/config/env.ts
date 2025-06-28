import Config from 'react-native-config';

export const ENV = {
  // API Configuration
  API_BASE_URL: Config.API_BASE_URL || 'http://localhost:3000/api',
  SOLANA_RPC_URL: Config.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  ETHEREUM_RPC_URL: Config.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  
  // Environment
  ENVIRONMENT: Config.ENVIRONMENT || 'development',
  
  // Wallet Configuration
  PHANTOM_APP_ID: Config.PHANTOM_APP_ID || 'your-phantom-app-id',
  WALLETCONNECT_PROJECT_ID: Config.WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
  
  // Jupiter API (Solana Swaps)
  JUPITER_API_URL: Config.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
  
  // 0x API (Ethereum Swaps)
  ZEROX_API_URL: Config.ZEROX_API_URL || 'https://api.0x.org',
  ZEROX_API_KEY: Config.ZEROX_API_KEY || 'your-0x-api-key',
  
  // Firebase Configuration
  FIREBASE_API_KEY: Config.FIREBASE_API_KEY || 'your-firebase-api-key',
  FIREBASE_AUTH_DOMAIN: Config.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  FIREBASE_PROJECT_ID: Config.FIREBASE_PROJECT_ID || 'your-project-id',
  FIREBASE_STORAGE_BUCKET: Config.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: Config.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  FIREBASE_APP_ID: Config.FIREBASE_APP_ID || 'your-firebase-app-id',
  
  // Feature Flags
  ENABLE_NOTIFICATIONS: Config.ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: Config.ENABLE_ANALYTICS === 'true',
  ENABLE_TESTNET: Config.ENABLE_TESTNET === 'true',
};

export const NETWORK_CONFIG = {
  SOLANA: {
    MAINNET: 'https://api.mainnet-beta.solana.com',
    TESTNET: 'https://api.testnet.solana.com',
    DEVNET: 'https://api.devnet.solana.com',
  },
  ETHEREUM: {
    MAINNET: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    TESTNET: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    DEVNET: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
}; 