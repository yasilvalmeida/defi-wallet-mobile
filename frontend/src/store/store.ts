import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import walletReducer from './slices/walletSlice';
import swapReducer from './slices/swapSlice';
import transactionReducer from './slices/transactionSlice';
import settingsReducer from './slices/settingsSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    wallet: walletReducer,
    swap: swapReducer,
    transactions: transactionReducer,
    settings: settingsReducer,
    // RTK Query API
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
