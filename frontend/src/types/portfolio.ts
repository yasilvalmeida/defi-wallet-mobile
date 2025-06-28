import { Network } from './wallet';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  network: Network;
  isNative?: boolean;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface TokenBalance {
  token: Token;
  balance: number;
  balanceFormatted: string;
  usdValue: number;
  percentage: number;
}

export interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  tokens: TokenBalance[];
  lastUpdated: Date;
}

export interface Transaction {
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
  network: Network;
  from: string;
  to: string;
  amount: number;
  token: Token;
  fee: number;
  feeToken: Token;
  usdValue?: number;
  confirmations: number;
  blockNumber?: number;
}

export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  APPROVE = 'approve',
  UNKNOWN = 'unknown',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface TokenPrice {
  token: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: Date;
}

export interface PriceChart {
  token: string;
  timeframe: ChartTimeframe;
  data: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

export enum ChartTimeframe {
  ONE_HOUR = '1h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  ONE_YEAR = '1y',
} 