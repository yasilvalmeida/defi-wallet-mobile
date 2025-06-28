// Mock blockchain libraries
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn(() => Promise.resolve(1000000000)), // 1 SOL in lamports
    getAccountInfo: jest.fn(() => Promise.resolve({ lamports: 1000000000 })),
    sendTransaction: jest.fn(() => Promise.resolve('mock-tx-hash')),
    confirmTransaction: jest.fn(() => Promise.resolve({ value: { err: null } })),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({
    toString: () => key,
    toBase58: () => key,
  })),
  SystemProgram: {
    transfer: jest.fn(() => ({ keys: [], programId: 'system', data: 'mock-data' })),
  },
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    serialize: jest.fn(() => Buffer.from('mock-serialized-tx')),
  })),
  LAMPORTS_PER_SOL: 1000000000,
}));

jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn(() => Promise.resolve('1000000000000000000')), // 1 ETH in wei
    getTransactionCount: jest.fn(() => Promise.resolve(10)),
    sendTransaction: jest.fn(() => Promise.resolve({ hash: 'mock-tx-hash' })),
    waitForTransaction: jest.fn(() => Promise.resolve({ status: 1 })),
  })),
  Wallet: jest.fn().mockImplementation(() => ({
    address: '0x742d35Cc6634C0532925a3b8D429D87d0c4FA',
    connect: jest.fn(),
    signTransaction: jest.fn(() => Promise.resolve('mock-signature')),
  })),
  formatEther: jest.fn((value) => '1.0'),
  parseEther: jest.fn((value) => '1000000000000000000'),
  formatUnits: jest.fn((value, decimals) => '1.0'),
  parseUnits: jest.fn((value, decimals) => '1000000'),
}));

jest.mock('web3', () => ({
  Web3: jest.fn().mockImplementation(() => ({
    eth: {
      getBalance: jest.fn(() => Promise.resolve('1000000000000000000')),
      getTransactionCount: jest.fn(() => Promise.resolve(10)),
      sendSignedTransaction: jest.fn(() => Promise.resolve({ transactionHash: 'mock-tx-hash' })),
      accounts: {
        create: jest.fn(() => ({ address: '0x742d35Cc6634C0532925a3b8D429D87d0c4FA' })),
      },
    },
    utils: {
      fromWei: jest.fn(() => '1'),
      toWei: jest.fn(() => '1000000000000000000'),
    },
  })),
}));

// Mock WalletConnect
jest.mock('@walletconnect/react-native-compat', () => ({}));
jest.mock('@walletconnect/web3wallet', () => ({
  Web3Wallet: {
    init: jest.fn(() => Promise.resolve({
      on: jest.fn(),
      pair: jest.fn(() => Promise.resolve()),
      respondSessionRequest: jest.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock NativeWind
jest.mock('nativewind', () => ({
  styled: (Component: any) => Component,
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock Lottie
jest.mock('lottie-react-native', () => 'LottieView');

// Mock SVG
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Export mock data
export const mockWalletAccount = {
  address: '0x742d35Cc6634C0532925a3b8D429D87d0c4FA',
  publicKey: '0x742d35Cc6634C0532925a3b8D429D87d0c4FA',
  network: 'ethereum_mainnet' as const,
  walletType: 'metamask' as const,
  balance: 1.5,
  isConnected: true,
};

export const mockSolanaAccount = {
  address: 'AaQ2rMr5D8HJ8nJ2JeQ5K8HJ8nJ2JeQ5K8HJ8nJ2JeQ5',
  publicKey: 'AaQ2rMr5D8HJ8nJ2JeQ5K8HJ8nJ2JeQ5K8HJ8nJ2JeQ5',
  network: 'solana_mainnet' as const,
  walletType: 'phantom' as const,
  balance: 2.3,
  isConnected: true,
};

export const mockToken = {
  address: '0xa0b86a33e6ba9e65c2a3f8e9b3b6e9c2a3f8e9b3b6e9c2a3f8e9b3b6e9c2a3f8e9',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  logoUrl: 'https://example.com/usdc.png',
  network: 'ethereum_mainnet' as const,
  price: 1.00,
  priceChange24h: 0.01,
  marketCap: 50000000000,
  volume24h: 1000000000,
};

export const mockTokenBalance = {
  token: mockToken,
  balance: 1000,
  balanceFormatted: '1,000.00',
  usdValue: 1000,
  percentage: 50,
};

export const mockPortfolio = {
  totalValue: 2000,
  totalChange24h: 50,
  totalChangePercentage24h: 2.5,
  tokens: [mockTokenBalance],
  lastUpdated: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockSwapQuote = {
  id: 'mock-quote-id',
  fromToken: mockToken,
  toToken: { ...mockToken, symbol: 'WETH', name: 'Wrapped Ether' },
  fromAmount: 1000,
  toAmount: 0.5,
  toAmountMin: 0.49,
  rate: 0.5,
  priceImpact: 0.1,
  fee: 2,
  feeToken: mockToken,
  route: [],
  estimatedGas: 150000,
  provider: 'uniswap' as const,
  validUntil: new Date('2024-01-01T01:00:00.000Z'),
  slippage: 0.5,
}; 