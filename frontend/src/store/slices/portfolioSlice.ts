import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, TokenBalance, Transaction } from '../../types/portfolio';

interface PortfolioState {
  portfolios: Record<string, Portfolio>; // key: address
  transactions: Record<string, Transaction[]>; // key: address
  isLoading: boolean;
  lastUpdated?: Date;
  error?: string;
}

const initialState: PortfolioState = {
  portfolios: {},
  transactions: {},
  isLoading: false,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setPortfolio: (state, action: PayloadAction<{ address: string; portfolio: Portfolio }>) => {
      const { address, portfolio } = action.payload;
      state.portfolios[address] = portfolio;
      state.lastUpdated = new Date();
      state.error = undefined;
    },
    
    updateTokenBalance: (state, action: PayloadAction<{ 
      address: string; 
      tokenBalance: TokenBalance 
    }>) => {
      const { address, tokenBalance } = action.payload;
      const portfolio = state.portfolios[address];
      
      if (portfolio) {
        const existingTokenIndex = portfolio.tokens.findIndex(
          tb => tb.token.address === tokenBalance.token.address
        );
        
        if (existingTokenIndex >= 0) {
          portfolio.tokens[existingTokenIndex] = tokenBalance;
        } else {
          portfolio.tokens.push(tokenBalance);
        }
        
        // Recalculate total value
        portfolio.totalValue = portfolio.tokens.reduce((sum, tb) => sum + tb.usdValue, 0);
        portfolio.lastUpdated = new Date();
      }
    },
    
    setTransactions: (state, action: PayloadAction<{ 
      address: string; 
      transactions: Transaction[] 
    }>) => {
      const { address, transactions } = action.payload;
      state.transactions[address] = transactions;
    },
    
    addTransaction: (state, action: PayloadAction<{ 
      address: string; 
      transaction: Transaction 
    }>) => {
      const { address, transaction } = action.payload;
      
      if (!state.transactions[address]) {
        state.transactions[address] = [];
      }
      
      // Add to beginning of array (most recent first)
      state.transactions[address].unshift(transaction);
      
      // Keep only last 100 transactions
      state.transactions[address] = state.transactions[address].slice(0, 100);
    },
    
    updateTransaction: (state, action: PayloadAction<{ 
      address: string; 
      hash: string; 
      updates: Partial<Transaction> 
    }>) => {
      const { address, hash, updates } = action.payload;
      const transactions = state.transactions[address];
      
      if (transactions) {
        const transactionIndex = transactions.findIndex(tx => tx.hash === hash);
        if (transactionIndex >= 0) {
          transactions[transactionIndex] = { ...transactions[transactionIndex], ...updates };
        }
      }
    },
    
    clearPortfolio: (state, action: PayloadAction<string>) => {
      const address = action.payload;
      delete state.portfolios[address];
      delete state.transactions[address];
    },
    
    clearAllPortfolios: (state) => {
      state.portfolios = {};
      state.transactions = {};
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const {
  setLoading,
  setPortfolio,
  updateTokenBalance,
  setTransactions,
  addTransaction,
  updateTransaction,
  clearPortfolio,
  clearAllPortfolios,
  setError,
  clearError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer; 