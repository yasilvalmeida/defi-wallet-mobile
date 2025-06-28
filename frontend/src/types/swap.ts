import { Network, Token } from './portfolio';

export interface SwapQuote {
  id: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  toAmountMin: number;
  rate: number;
  priceImpact: number;
  fee: number;
  feeToken: Token;
  route: SwapRoute[];
  estimatedGas: number;
  provider: SwapProvider;
  validUntil: Date;
  slippage: number;
}

export interface SwapRoute {
  protocol: string;
  pool: string;
  fromToken: Token;
  toToken: Token;
  share: number;
}

export enum SwapProvider {
  JUPITER = 'jupiter',
  ZEROX = '0x',
  UNISWAP = 'uniswap',
  PANCAKESWAP = 'pancakeswap',
}

export interface SwapRequest {
  fromToken: Token;
  toToken: Token;
  amount: number;
  slippage: number;
  userAddress: string;
  network: Network;
}

export interface SwapTransaction {
  quote: SwapQuote;
  transaction: {
    to: string;
    data: string;
    value: string;
    gasLimit: number;
    gasPrice: number;
  };
}

export interface SwapHistory {
  id: string;
  timestamp: Date;
  fromToken: Token;
  toToken: Token;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  txHash: string;
  status: SwapStatus;
  network: Network;
  provider: SwapProvider;
}

export enum SwapStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface SwapSettings {
  slippage: number;
  gasPrice: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice?: number;
  deadline: number;
  expertMode: boolean;
  soundEnabled: boolean;
}

export interface TokenPair {
  fromToken: Token;
  toToken: Token;
  liquidity: number;
  volume24h: number;
  fee: number;
} 