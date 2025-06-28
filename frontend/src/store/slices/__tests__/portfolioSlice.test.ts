import portfolioReducer, {
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
} from '../portfolioSlice';
import { TransactionType, TransactionStatus } from '../../../types/portfolio';
import { mockPortfolio, mockTokenBalance, mockToken } from '../../../test/mocks';

describe('portfolioSlice', () => {
  const initialState = {
    portfolios: {},
    transactions: {},
    isLoading: false,
  };

  const testAddress = '0x742d35Cc6634C0532925a3b8D429D87d0c4FA';

  it('should return the initial state', () => {
    expect(portfolioReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const actual = portfolioReducer(initialState, setLoading(true));
      expect(actual.isLoading).toBe(true);
    });
  });

  describe('setPortfolio', () => {
    it('should set portfolio for address', () => {
      const actual = portfolioReducer(
        initialState,
        setPortfolio({
          address: testAddress,
          portfolio: mockPortfolio,
        })
      );

      expect(actual.portfolios[testAddress]).toEqual(mockPortfolio);
      expect(actual.lastUpdated).toBeDefined();
      expect(actual.error).toBeUndefined();
    });
  });

  describe('updateTokenBalance', () => {
    it('should update existing token balance', () => {
      const state = {
        ...initialState,
        portfolios: {
          [testAddress]: {
            ...mockPortfolio,
            tokens: [mockTokenBalance],
          },
        },
      };

      const updatedTokenBalance = {
        ...mockTokenBalance,
        balance: 2000,
        balanceFormatted: '2,000.00',
        usdValue: 2000,
      };

      const actual = portfolioReducer(
        state,
        updateTokenBalance({
          address: testAddress,
          tokenBalance: updatedTokenBalance,
        })
      );

      expect(actual.portfolios[testAddress].tokens[0]).toEqual(updatedTokenBalance);
      expect(actual.portfolios[testAddress].totalValue).toBe(2000);
    });

    it('should add new token balance', () => {
      const state = {
        ...initialState,
        portfolios: {
          [testAddress]: {
            ...mockPortfolio,
            tokens: [],
            totalValue: 0,
          },
        },
      };

      const actual = portfolioReducer(
        state,
        updateTokenBalance({
          address: testAddress,
          tokenBalance: mockTokenBalance,
        })
      );

      expect(actual.portfolios[testAddress].tokens).toHaveLength(1);
      expect(actual.portfolios[testAddress].tokens[0]).toEqual(mockTokenBalance);
      expect(actual.portfolios[testAddress].totalValue).toBe(mockTokenBalance.usdValue);
    });
  });

  describe('setTransactions', () => {
    it('should set transactions for address', () => {
      const mockTransaction = {
        hash: 'test-hash',
        type: TransactionType.SEND,
        status: TransactionStatus.CONFIRMED,
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        network: 'ethereum_mainnet' as const,
        from: testAddress,
        to: '0x123',
        amount: 100,
        token: mockToken,
        fee: 0.01,
        feeToken: mockToken,
        confirmations: 12,
      };

      const actual = portfolioReducer(
        initialState,
        setTransactions({
          address: testAddress,
          transactions: [mockTransaction],
        })
      );

      expect(actual.transactions[testAddress]).toEqual([mockTransaction]);
    });
  });

  describe('addTransaction', () => {
    it('should add transaction to beginning of array', () => {
      const existingTransaction = {
        hash: 'existing-hash',
        type: TransactionType.RECEIVE,
        status: TransactionStatus.CONFIRMED,
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        network: 'ethereum_mainnet' as const,
        from: '0x123',
        to: testAddress,
        amount: 50,
        token: mockToken,
        fee: 0.005,
        feeToken: mockToken,
        confirmations: 24,
      };

      const newTransaction = {
        hash: 'new-hash',
        type: TransactionType.SEND,
        status: TransactionStatus.PENDING,
        timestamp: new Date('2024-01-01T01:00:00.000Z'),
        network: 'ethereum_mainnet' as const,
        from: testAddress,
        to: '0x456',
        amount: 25,
        token: mockToken,
        fee: 0.01,
        feeToken: mockToken,
        confirmations: 0,
      };

      const state = {
        ...initialState,
        transactions: {
          [testAddress]: [existingTransaction],
        },
      };

      const actual = portfolioReducer(
        state,
        addTransaction({
          address: testAddress,
          transaction: newTransaction,
        })
      );

      expect(actual.transactions[testAddress]).toHaveLength(2);
      expect(actual.transactions[testAddress][0]).toEqual(newTransaction);
      expect(actual.transactions[testAddress][1]).toEqual(existingTransaction);
    });

    it('should limit transactions to 100', () => {
      const transactions = Array.from({ length: 100 }, (_, i) => ({
        hash: `hash-${i}`,
        type: TransactionType.SEND,
        status: TransactionStatus.CONFIRMED,
        timestamp: new Date(`2024-01-01T${i.toString().padStart(2, '0')}:00:00.000Z`),
        network: 'ethereum_mainnet' as const,
        from: testAddress,
        to: '0x123',
        amount: 1,
        token: mockToken,
        fee: 0.001,
        feeToken: mockToken,
        confirmations: 12,
      }));

      const state = {
        ...initialState,
        transactions: {
          [testAddress]: transactions,
        },
      };

      const newTransaction = {
        hash: 'new-hash',
        type: TransactionType.SEND,
        status: TransactionStatus.PENDING,
        timestamp: new Date('2024-01-02T00:00:00.000Z'),
        network: 'ethereum_mainnet' as const,
        from: testAddress,
        to: '0x456',
        amount: 25,
        token: mockToken,
        fee: 0.01,
        feeToken: mockToken,
        confirmations: 0,
      };

      const actual = portfolioReducer(
        state,
        addTransaction({
          address: testAddress,
          transaction: newTransaction,
        })
      );

      expect(actual.transactions[testAddress]).toHaveLength(100);
      expect(actual.transactions[testAddress][0]).toEqual(newTransaction);
    });
  });

  describe('updateTransaction', () => {
    it('should update existing transaction', () => {
      const transaction = {
        hash: 'test-hash',
        type: TransactionType.SEND,
        status: TransactionStatus.PENDING,
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        network: 'ethereum_mainnet' as const,
        from: testAddress,
        to: '0x123',
        amount: 100,
        token: mockToken,
        fee: 0.01,
        feeToken: mockToken,
        confirmations: 0,
      };

      const state = {
        ...initialState,
        transactions: {
          [testAddress]: [transaction],
        },
      };

      const actual = portfolioReducer(
        state,
        updateTransaction({
          address: testAddress,
          hash: 'test-hash',
          updates: {
            status: TransactionStatus.CONFIRMED,
            confirmations: 12,
          },
        })
      );

      expect(actual.transactions[testAddress][0].status).toBe(TransactionStatus.CONFIRMED);
      expect(actual.transactions[testAddress][0].confirmations).toBe(12);
    });
  });

  describe('clearPortfolio', () => {
    it('should clear portfolio and transactions for address', () => {
      const state = {
        ...initialState,
        portfolios: {
          [testAddress]: mockPortfolio,
        },
        transactions: {
          [testAddress]: [],
        },
      };

      const actual = portfolioReducer(state, clearPortfolio(testAddress));

      expect(actual.portfolios[testAddress]).toBeUndefined();
      expect(actual.transactions[testAddress]).toBeUndefined();
    });
  });

  describe('clearAllPortfolios', () => {
    it('should clear all portfolios and transactions', () => {
      const state = {
        ...initialState,
        portfolios: {
          [testAddress]: mockPortfolio,
          '0x456': mockPortfolio,
        },
        transactions: {
          [testAddress]: [],
          '0x456': [],
        },
      };

      const actual = portfolioReducer(state, clearAllPortfolios());

      expect(actual.portfolios).toEqual({});
      expect(actual.transactions).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should set error and stop loading', () => {
      const state = { ...initialState, isLoading: true };
      const actual = portfolioReducer(state, setError('Network error'));

      expect(actual.error).toBe('Network error');
      expect(actual.isLoading).toBe(false);
    });

    it('should clear error', () => {
      const state = { ...initialState, error: 'Test error' };
      const actual = portfolioReducer(state, clearError());

      expect(actual.error).toBeUndefined();
    });
  });
}); 