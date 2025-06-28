import walletReducer, {
  setConnecting,
  setWalletConnection,
  setSelectedWallet,
  setSelectedNetwork,
  setSelectedAccount,
  updateAccountBalance,
  disconnectWallet,
  disconnectAllWallets,
  setError,
  clearError,
} from '../walletSlice';
import { WalletType, Network } from '../../../types/wallet';
import { mockWalletAccount, mockSolanaAccount } from '../../../test/mocks';

describe('walletSlice', () => {
  const initialState = {
    connections: {
      [WalletType.PHANTOM]: {
        isConnected: false,
        accounts: [],
        network: Network.SOLANA_MAINNET,
      },
      [WalletType.METAMASK]: {
        isConnected: false,
        accounts: [],
        network: Network.ETHEREUM_MAINNET,
      },
      [WalletType.WALLETCONNECT]: {
        isConnected: false,
        accounts: [],
        network: Network.ETHEREUM_MAINNET,
      },
    },
    selectedNetwork: Network.SOLANA_MAINNET,
    isConnecting: false,
  };

  it('should return the initial state', () => {
    expect(walletReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setConnecting', () => {
    it('should set connecting state to true', () => {
      const actual = walletReducer(initialState, setConnecting(true));
      expect(actual.isConnecting).toBe(true);
      expect(actual.error).toBeUndefined();
    });

    it('should set connecting state to false', () => {
      const state = { ...initialState, isConnecting: true, error: 'Test error' };
      const actual = walletReducer(state, setConnecting(false));
      expect(actual.isConnecting).toBe(false);
      expect(actual.error).toBe('Test error'); // Error should remain if not connecting
    });
  });

  describe('setWalletConnection', () => {
    it('should set wallet connection and update selected wallet', () => {
      const connection = {
        isConnected: true,
        accounts: [mockWalletAccount],
        selectedAccount: mockWalletAccount,
        network: Network.ETHEREUM_MAINNET,
      };

      const actual = walletReducer(
        initialState,
        setWalletConnection({
          walletType: WalletType.METAMASK,
          connection,
        })
      );

      expect(actual.connections[WalletType.METAMASK]).toEqual(connection);
      expect(actual.selectedWallet).toBe(WalletType.METAMASK);
      expect(actual.selectedNetwork).toBe(Network.ETHEREUM_MAINNET);
      expect(actual.isConnecting).toBe(false);
      expect(actual.error).toBeUndefined();
    });

    it('should not update selected wallet if connection is not active', () => {
      const connection = {
        isConnected: false,
        accounts: [],
        network: Network.ETHEREUM_MAINNET,
      };

      const actual = walletReducer(
        initialState,
        setWalletConnection({
          walletType: WalletType.METAMASK,
          connection,
        })
      );

      expect(actual.connections[WalletType.METAMASK]).toEqual(connection);
      expect(actual.selectedWallet).toBeUndefined();
    });
  });

  describe('setSelectedWallet', () => {
    it('should set selected wallet and update network if connected', () => {
      const state = {
        ...initialState,
        connections: {
          ...initialState.connections,
          [WalletType.PHANTOM]: {
            isConnected: true,
            accounts: [mockSolanaAccount],
            network: Network.SOLANA_TESTNET,
          },
        },
      };

      const actual = walletReducer(state, setSelectedWallet(WalletType.PHANTOM));

      expect(actual.selectedWallet).toBe(WalletType.PHANTOM);
      expect(actual.selectedNetwork).toBe(Network.SOLANA_TESTNET);
    });
  });

  describe('setSelectedNetwork', () => {
    it('should update selected network and wallet connection network', () => {
      const state = {
        ...initialState,
        selectedWallet: WalletType.METAMASK,
        connections: {
          ...initialState.connections,
          [WalletType.METAMASK]: {
            isConnected: true,
            accounts: [mockWalletAccount],
            network: Network.ETHEREUM_MAINNET,
          },
        },
      };

      const actual = walletReducer(state, setSelectedNetwork(Network.ETHEREUM_TESTNET));

      expect(actual.selectedNetwork).toBe(Network.ETHEREUM_TESTNET);
      expect(actual.connections[WalletType.METAMASK].network).toBe(Network.ETHEREUM_TESTNET);
    });
  });

  describe('setSelectedAccount', () => {
    it('should set selected account for wallet', () => {
      const state = {
        ...initialState,
        connections: {
          ...initialState.connections,
          [WalletType.METAMASK]: {
            isConnected: true,
            accounts: [mockWalletAccount],
            network: Network.ETHEREUM_MAINNET,
          },
        },
      };

      const actual = walletReducer(
        state,
        setSelectedAccount({
          walletType: WalletType.METAMASK,
          account: mockWalletAccount,
        })
      );

      expect(actual.connections[WalletType.METAMASK].selectedAccount).toEqual(mockWalletAccount);
    });
  });

  describe('updateAccountBalance', () => {
    it('should update account balance', () => {
      const state = {
        ...initialState,
        connections: {
          ...initialState.connections,
          [WalletType.METAMASK]: {
            isConnected: true,
            accounts: [{ ...mockWalletAccount, balance: 1.0 }],
            network: Network.ETHEREUM_MAINNET,
          },
        },
      };

      const actual = walletReducer(
        state,
        updateAccountBalance({
          walletType: WalletType.METAMASK,
          address: mockWalletAccount.address,
          balance: 2.5,
        })
      );

      expect(actual.connections[WalletType.METAMASK].accounts[0].balance).toBe(2.5);
    });
  });

  describe('disconnectWallet', () => {
    it('should disconnect wallet and clear selected wallet', () => {
      const state = {
        ...initialState,
        selectedWallet: WalletType.METAMASK,
        connections: {
          ...initialState.connections,
          [WalletType.METAMASK]: {
            isConnected: true,
            accounts: [mockWalletAccount],
            network: Network.ETHEREUM_MAINNET,
          },
        },
      };

      const actual = walletReducer(state, disconnectWallet(WalletType.METAMASK));

      expect(actual.connections[WalletType.METAMASK]).toEqual({
        isConnected: false,
        accounts: [],
        network: Network.ETHEREUM_MAINNET,
      });
      expect(actual.selectedWallet).toBeUndefined();
    });
  });

  describe('disconnectAllWallets', () => {
    it('should disconnect all wallets', () => {
      const state = {
        ...initialState,
        selectedWallet: WalletType.METAMASK,
        connections: {
          [WalletType.PHANTOM]: {
            isConnected: true,
            accounts: [mockSolanaAccount],
            network: Network.SOLANA_MAINNET,
          },
          [WalletType.METAMASK]: {
            isConnected: true,
            accounts: [mockWalletAccount],
            network: Network.ETHEREUM_MAINNET,
          },
          [WalletType.WALLETCONNECT]: {
            isConnected: true,
            accounts: [mockWalletAccount],
            network: Network.ETHEREUM_MAINNET,
          },
        },
      };

      const actual = walletReducer(state, disconnectAllWallets());

      expect(actual.selectedWallet).toBeUndefined();
      Object.values(actual.connections).forEach((connection) => {
        expect(connection.isConnected).toBe(false);
        expect(connection.accounts).toEqual([]);
      });
    });
  });

  describe('error handling', () => {
    it('should set error and stop connecting', () => {
      const state = { ...initialState, isConnecting: true };
      const actual = walletReducer(state, setError('Connection failed'));

      expect(actual.error).toBe('Connection failed');
      expect(actual.isConnecting).toBe(false);
    });

    it('should clear error', () => {
      const state = { ...initialState, error: 'Test error' };
      const actual = walletReducer(state, clearError());

      expect(actual.error).toBeUndefined();
    });
  });
}); 