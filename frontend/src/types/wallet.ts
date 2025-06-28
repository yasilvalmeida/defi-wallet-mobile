export enum WalletType {
  PHANTOM = 'phantom',
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
}

export enum Network {
  SOLANA_MAINNET = 'solana_mainnet',
  SOLANA_TESTNET = 'solana_testnet',
  SOLANA_DEVNET = 'solana_devnet',
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  ETHEREUM_TESTNET = 'ethereum_testnet',
  ETHEREUM_DEVNET = 'ethereum_devnet',
}

export interface WalletAccount {
  address: string;
  publicKey: string;
  network: Network;
  walletType: WalletType;
  balance?: number;
  isConnected: boolean;
}

export interface WalletConnection {
  isConnected: boolean;
  accounts: WalletAccount[];
  selectedAccount?: WalletAccount;
  network: Network;
}

export interface WalletConnectOptions {
  walletType: WalletType;
  network: Network;
  autoConnect?: boolean;
}

export interface WalletTransactionRequest {
  to: string;
  amount: number;
  token?: string;
  network: Network;
  gasLimit?: number;
  gasPrice?: number;
  data?: string;
}

export interface WalletTransactionResult {
  hash: string;
  success: boolean;
  confirmations: number;
  gasUsed?: number;
  error?: string;
} 