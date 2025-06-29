export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filter: TransactionFilter;
  selectedTransaction: Transaction | null;
}

export interface Transaction {
  id: string;
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  network: 'solana' | 'ethereum';
  timestamp: number;
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  tokenAddress: string;
  usdValue: number;
  fee: string;
  feeSymbol: string;
  confirmations: number;
  blockNumber?: number;
  description: string;
  metadata?: TransactionMetadata;
}

export interface TransactionMetadata {
  // For swap transactions
  swapDetails?: {
    fromToken: string;
    fromAmount: string;
    toToken: string;
    toAmount: string;
    protocol: string;
    slippage: number;
    priceImpact: number;
  };
  // For NFT transactions
  nftDetails?: {
    collection: string;
    tokenId: string;
    name: string;
    image: string;
  };
  // For DeFi interactions
  defiDetails?: {
    protocol: string;
    action: string;
    poolAddress?: string;
    apr?: number;
  };
}

export type TransactionType = 
  | 'swap' 
  | 'send' 
  | 'receive' 
  | 'stake' 
  | 'unstake' 
  | 'defi' 
  | 'nft';

export type TransactionStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'failed' 
  | 'cancelled';

export interface TransactionFilter {
  type: TransactionType | 'all';
  status: TransactionStatus | 'all';
  network: 'solana' | 'ethereum' | 'all';
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
}

export interface CreateTransactionRequest {
  type: TransactionType;
  network: 'solana' | 'ethereum';
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  tokenAddress: string;
  metadata?: TransactionMetadata;
}
