import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WalletConnection, WalletAccount, Network, WalletType } from '../../types/wallet';

interface WalletState {
  connections: Record<WalletType, WalletConnection>;
  selectedWallet?: WalletType;
  selectedNetwork: Network;
  isConnecting: boolean;
  error?: string;
}

const initialState: WalletState = {
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

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        state.error = undefined;
      }
    },
    
    setWalletConnection: (state, action: PayloadAction<{ 
      walletType: WalletType; 
      connection: WalletConnection 
    }>) => {
      const { walletType, connection } = action.payload;
      state.connections[walletType] = connection;
      
      if (connection.isConnected) {
        state.selectedWallet = walletType;
        state.selectedNetwork = connection.network;
      }
      
      state.isConnecting = false;
      state.error = undefined;
    },
    
    setSelectedWallet: (state, action: PayloadAction<WalletType>) => {
      state.selectedWallet = action.payload;
      const connection = state.connections[action.payload];
      if (connection.isConnected) {
        state.selectedNetwork = connection.network;
      }
    },
    
    setSelectedNetwork: (state, action: PayloadAction<Network>) => {
      state.selectedNetwork = action.payload;
      
      // Update the selected wallet's network if connected
      if (state.selectedWallet) {
        const connection = state.connections[state.selectedWallet];
        if (connection.isConnected) {
          connection.network = action.payload;
        }
      }
    },
    
    setSelectedAccount: (state, action: PayloadAction<{
      walletType: WalletType;
      account: WalletAccount;
    }>) => {
      const { walletType, account } = action.payload;
      const connection = state.connections[walletType];
      if (connection) {
        connection.selectedAccount = account;
      }
    },
    
    updateAccountBalance: (state, action: PayloadAction<{
      walletType: WalletType;
      address: string;
      balance: number;
    }>) => {
      const { walletType, address, balance } = action.payload;
      const connection = state.connections[walletType];
      
      if (connection) {
        const account = connection.accounts.find(acc => acc.address === address);
        if (account) {
          account.balance = balance;
        }
      }
    },
    
    disconnectWallet: (state, action: PayloadAction<WalletType>) => {
      const walletType = action.payload;
      state.connections[walletType] = {
        isConnected: false,
        accounts: [],
        network: walletType === WalletType.PHANTOM ? Network.SOLANA_MAINNET : Network.ETHEREUM_MAINNET,
      };
      
      if (state.selectedWallet === walletType) {
        state.selectedWallet = undefined;
      }
    },
    
    disconnectAllWallets: (state) => {
      Object.keys(state.connections).forEach(walletType => {
        const wType = walletType as WalletType;
        state.connections[wType] = {
          isConnected: false,
          accounts: [],
          network: wType === WalletType.PHANTOM ? Network.SOLANA_MAINNET : Network.ETHEREUM_MAINNET,
        };
      });
      state.selectedWallet = undefined;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const {
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
} = walletSlice.actions;

export default walletSlice.reducer; 