import { Test } from '@nestjs/testing';

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    flushall: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  }));
});

// Mock Solana Web3
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn(() => Promise.resolve(1000000000)),
    getAccountInfo: jest.fn(() => Promise.resolve({ lamports: 1000000000 })),
    getTokenAccountsByOwner: jest.fn(() => Promise.resolve({ value: [] })),
    getParsedAccountInfo: jest.fn(() => Promise.resolve({ value: null })),
    getRecentBlockhash: jest.fn(() => Promise.resolve({ blockhash: 'test', feeCalculator: { lamportsPerSignature: 5000 } })),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({
    toString: () => key,
    toBase58: () => key,
  })),
  LAMPORTS_PER_SOL: 1000000000,
}));

// Mock Ethers
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn(() => Promise.resolve('1000000000000000000')),
    getTransactionCount: jest.fn(() => Promise.resolve(10)),
    getGasPrice: jest.fn(() => Promise.resolve('20000000000')),
    getBlockNumber: jest.fn(() => Promise.resolve(12345)),
  })),
  formatEther: jest.fn((value) => '1.0'),
  parseEther: jest.fn((value) => '1000000000000000000'),
  formatUnits: jest.fn((value, decimals) => '1.0'),
  parseUnits: jest.fn((value, decimals) => '1000000'),
}));

// Mock Web3
jest.mock('web3', () => ({
  Web3: jest.fn().mockImplementation(() => ({
    eth: {
      getBalance: jest.fn(() => Promise.resolve('1000000000000000000')),
      getTransactionCount: jest.fn(() => Promise.resolve(10)),
      getGasPrice: jest.fn(() => Promise.resolve('20000000000')),
      getBlockNumber: jest.fn(() => Promise.resolve(12345)),
    },
    utils: {
      fromWei: jest.fn(() => '1'),
      toWei: jest.fn(() => '1000000000000000000'),
    },
  })),
}));

// Mock Axios for external API calls
jest.mock('axios', () => ({
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Global test timeout
jest.setTimeout(30000);

// Helper function to create NestJS testing module
export const createTestingModule = async (metadata: any) => {
  return Test.createTestingModule(metadata).compile();
}; 