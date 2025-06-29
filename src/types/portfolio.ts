export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  balance: string;
  usdValue: number;
  price: number;
  change24h: number;
}

export interface Portfolio {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  tokens: Token[];
  lastUpdated: string;
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  selectedAddress: string | null;
  selectedNetwork: 'solana' | 'ethereum';
}
