import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TransactionState, Transaction, TransactionFilter, CreateTransactionRequest } from '../../types/transaction';

// Mock transaction data for demo
const generateMockTransactions = (): Transaction[] => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  return [
    {
      id: 'tx-1',
      hash: '5KJp7KpXjg2eU8dFzAe9qJ9XcFd3bNm1cWvH4A3sT2xR8pL9',
      type: 'swap',
      status: 'confirmed',
      network: 'solana',
      timestamp: now - (2 * 60 * 60 * 1000), // 2 hours ago
      fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      amount: '2.5',
      tokenSymbol: 'SOL',
      tokenAddress: 'So11111111111111111111111111111111111111112',
      usdValue: 587.50,
      fee: '0.00025',
      feeSymbol: 'SOL',
      confirmations: 148,
      blockNumber: 284765890,
      description: 'Swapped SOL for USDC',
      metadata: {
        swapDetails: {
          fromToken: 'SOL',
          fromAmount: '2.5',
          toToken: 'USDC',
          toAmount: '587.25',
          protocol: 'Jupiter',
          slippage: 0.5,
          priceImpact: 0.12,
        }
      }
    },
    {
      id: 'tx-2',
      hash: '0x8a5f2d9c4b7e1a3f6d8e9b2c4a7f1e5d3b8c6a9f2e1d4c7b',
      type: 'receive',
      status: 'confirmed',
      network: 'ethereum',
      timestamp: now - (8 * 60 * 60 * 1000), // 8 hours ago
      fromAddress: '0x742d35Cc6339C4532CE58B7bdCF4777df3A747Ec',
      toAddress: '0x123d35Cc6339C4532CE58B7bdCF4777df3A747Ab',
      amount: '1500.00',
      tokenSymbol: 'USDC',
      tokenAddress: '0xA0b86a33E6441C5871EF3f14A0bf96E5a0b91A4F',
      usdValue: 1500.00,
      fee: '0.0023',
      feeSymbol: 'ETH',
      confirmations: 45,
      blockNumber: 19123456,
      description: 'Received USDC from DeFi protocol',
    },
    {
      id: 'tx-3',
      hash: '3MNq8KpYjh3fV9eGzBf0rK0YdGe4cOp2dXwI5B4uU3yS9qM0',
      type: 'stake',
      status: 'confirmed',
      network: 'solana',
      timestamp: now - (1 * day), // 1 day ago
      fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      toAddress: 'StakePool123456789abcdef',
      amount: '50.0',
      tokenSymbol: 'SOL',
      tokenAddress: 'So11111111111111111111111111111111111111112',
      usdValue: 11750.00,
      fee: '0.0005',
      feeSymbol: 'SOL',
      confirmations: 2145,
      description: 'Staked SOL in validator pool',
      metadata: {
        defiDetails: {
          protocol: 'Marinade Finance',
          action: 'stake',
          apr: 6.8,
        }
      }
    },
    {
      id: 'tx-4',
      hash: '7PQr9LqZkj4gW0fHzCg1sL1ZeHf5dRq3eYxJ6C5vV4zT0rN9',
      type: 'send',
      status: 'pending',
      network: 'solana',
      timestamp: now - (30 * 60 * 1000), // 30 minutes ago
      fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      toAddress: 'FriendsWallet123456789abcdef',
      amount: '100.0',
      tokenSymbol: 'USDC',
      tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      usdValue: 100.00,
      fee: '0.0001',
      feeSymbol: 'SOL',
      confirmations: 0,
      description: 'Sent USDC to friend',
    },
    {
      id: 'tx-5',
      hash: '0x4f8a6d2c5b9e3a7f1d6e8b4c7a0f2e9d5c8b1a6f3e0d7c4b',
      type: 'swap',
      status: 'failed',
      network: 'ethereum',
      timestamp: now - (2 * day), // 2 days ago  
      fromAddress: '0x742d35Cc6339C4532CE58B7bdCF4777df3A747Ec',
      toAddress: '0x742d35Cc6339C4532CE58B7bdCF4777df3A747Ec',
      amount: '0.5',
      tokenSymbol: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      usdValue: 1850.00,
      fee: '0.0045',
      feeSymbol: 'ETH',
      confirmations: 0,
      description: 'Failed swap ETH for WBTC',
      metadata: {
        swapDetails: {
          fromToken: 'ETH',
          fromAmount: '0.5',
          toToken: 'WBTC',
          toAmount: '0.0184',
          protocol: '0x Protocol',
          slippage: 1.0,
          priceImpact: 0.8,
        }
      }
    },
    {
      id: 'tx-6',
      hash: '8RTu0MrAkm5hX1gIzDh2tM2AfJg6ePs4fZyK7D6wW5aC1sO0',
      type: 'defi',
      status: 'confirmed',
      network: 'solana',
      timestamp: now - (5 * day), // 5 days ago
      fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      toAddress: 'LiquidityPool987654321abcdef',
      amount: '1000.0',
      tokenSymbol: 'USDC',
      tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      usdValue: 1000.00,
      fee: '0.0002',
      feeSymbol: 'SOL',
      confirmations: 7845,
      description: 'Added liquidity to SOL-USDC pool',
      metadata: {
        defiDetails: {
          protocol: 'Raydium',
          action: 'add_liquidity',
          poolAddress: 'Pool123456789abcdef',
          apr: 24.5,
        }
      }
    },
  ];
};

// Async thunk for fetching transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filter: TransactionFilter, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let transactions = generateMockTransactions();
      
      // Apply filters
      if (filter.type !== 'all') {
        transactions = transactions.filter(tx => tx.type === filter.type);
      }
      
      if (filter.status !== 'all') {
        transactions = transactions.filter(tx => tx.status === filter.status);
      }
      
      if (filter.network !== 'all') {
        transactions = transactions.filter(tx => tx.network === filter.network);
      }
      
      // Apply time range filter
      const now = Date.now();
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        'all': Infinity,
      };
      
      if (filter.timeRange !== 'all') {
        const timeLimit = now - timeRanges[filter.timeRange];
        transactions = transactions.filter(tx => tx.timestamp >= timeLimit);
      }
      
      // Sort by timestamp (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      return transactions;
    } catch (error) {
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

// Async thunk for creating new transaction (when user makes a swap)
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (request: CreateTransactionRequest, { rejectWithValue }) => {
    try {
      // Simulate creating transaction
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        hash: `${Date.now().toString(36)}${Math.random().toString(36).substr(2)}`,
        type: request.type,
        status: 'pending',
        network: request.network,
        timestamp: Date.now(),
        fromAddress: request.fromAddress,
        toAddress: request.toAddress,
        amount: request.amount,
        tokenSymbol: request.tokenSymbol,
        tokenAddress: request.tokenAddress,
        usdValue: parseFloat(request.amount) * 235, // Mock USD conversion
        fee: request.network === 'solana' ? '0.0001' : '0.002',
        feeSymbol: request.network === 'solana' ? 'SOL' : 'ETH',
        confirmations: 0,
        description: `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} ${request.tokenSymbol}`,
        metadata: request.metadata,
      };
      
      return newTransaction;
    } catch (error) {
      return rejectWithValue('Failed to create transaction');
    }
  }
);

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  filter: {
    type: 'all',
    status: 'all',
    network: 'all',
    timeRange: 'all',
  },
  selectedTransaction: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<TransactionFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    selectTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTransactionStatus: (state, action: PayloadAction<{ id: string; status: 'confirmed' | 'failed' }>) => {
      const transaction = state.transactions.find(tx => tx.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
        if (action.payload.status === 'confirmed') {
          transaction.confirmations = 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create transaction  
      .addCase(createTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload); // Add to beginning
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, selectTransaction, clearError, updateTransactionStatus } = transactionSlice.actions;
export default transactionSlice.reducer;
