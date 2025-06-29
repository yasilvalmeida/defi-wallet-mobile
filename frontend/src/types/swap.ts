export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  error: string | null;
  routes: SwapRoute[];
  selectedRoute: SwapRoute | null;
  priceImpact: number;
  minimumReceived: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  price?: number;
}

export interface SwapRoute {
  id: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  marketInfos: MarketInfo[];
  protocol: 'jupiter' | '0x';
  estimatedGas: string;
  executionTime: number;
}

export interface MarketInfo {
  id: string;
  label: string;
  inputMint: string;
  outputMint: string;
  notEnoughLiquidity: boolean;
  inAmount: string;
  outAmount: string;
  priceImpact: number;
  lpFee: number;
  platformFee: number;
}

export interface SwapQuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  network: 'solana' | 'ethereum';
}

export interface SwapExecuteRequest extends SwapQuoteRequest {
  route: SwapRoute;
  userPublicKey: string;
}
