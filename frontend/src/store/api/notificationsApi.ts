import { baseApi } from './baseApi';

export interface CreatePriceAlertRequest {
  tokenSymbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currency?: string;
  network: 'solana' | 'ethereum';
  tokenAddress?: string;
}

export interface UpdatePriceAlertRequest {
  condition?: 'above' | 'below';
  targetPrice?: number;
  isActive?: boolean;
}

export interface PriceAlert {
  id: string;
  userId: string;
  tokenSymbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  currency: string;
  network: 'solana' | 'ethereum';
  tokenAddress?: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface NotificationPreferences {
  pushNotificationsEnabled: boolean;
  priceAlertsEnabled: boolean;
  transactionNotificationsEnabled: boolean;
  portfolioUpdatesEnabled: boolean;
  marketNewsEnabled: boolean;
}

export interface RegisterDeviceRequest {
  pushToken: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export interface PushNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'normal' | 'high';
  sound?: string;
}

export interface NotificationHistory {
  id: string;
  type: 'price_alert' | 'transaction' | 'portfolio_update' | 'market_news';
  title: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  data?: Record<string, any>;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Notification Preferences
    getNotificationPreferences: builder.query<NotificationPreferences, string>({
      query: userId => `/notifications/preferences/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'NotificationPreferences', id: userId },
      ],
    }),

    updateNotificationPreferences: builder.mutation<
      void,
      { userId: string; preferences: NotificationPreferences }
    >({
      query: ({ userId, preferences }) => ({
        url: `/notifications/preferences/${userId}`,
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'NotificationPreferences', id: userId },
      ],
    }),

    // Price Alerts
    getUserPriceAlerts: builder.query<PriceAlert[], string>({
      query: userId => `/notifications/price-alerts/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'PriceAlerts', id: userId },
        ...(result || []).map(alert => ({
          type: 'PriceAlerts' as const,
          id: alert.id,
        })),
      ],
    }),

    createPriceAlert: builder.mutation<
      PriceAlert,
      { userId: string; alertData: CreatePriceAlertRequest }
    >({
      query: ({ userId, alertData }) => ({
        url: `/notifications/price-alerts/${userId}`,
        method: 'POST',
        body: alertData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'PriceAlerts', id: userId },
      ],
    }),

    updatePriceAlert: builder.mutation<
      PriceAlert,
      { userId: string; alertId: string; updateData: UpdatePriceAlertRequest }
    >({
      query: ({ userId, alertId, updateData }) => ({
        url: `/notifications/price-alerts/${userId}/${alertId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { userId, alertId }) => [
        { type: 'PriceAlerts', id: userId },
        { type: 'PriceAlerts', id: alertId },
      ],
    }),

    deletePriceAlert: builder.mutation<
      void,
      { userId: string; alertId: string }
    >({
      query: ({ userId, alertId }) => ({
        url: `/notifications/price-alerts/${userId}/${alertId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId, alertId }) => [
        { type: 'PriceAlerts', id: userId },
        { type: 'PriceAlerts', id: alertId },
      ],
    }),

    togglePriceAlert: builder.mutation<
      PriceAlert,
      { userId: string; alertId: string }
    >({
      query: ({ userId, alertId }) => ({
        url: `/notifications/price-alerts/${userId}/${alertId}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { userId, alertId }) => [
        { type: 'PriceAlerts', id: userId },
        { type: 'PriceAlerts', id: alertId },
      ],
    }),

    // Push Notifications
    registerDevice: builder.mutation<
      void,
      { userId: string; deviceData: RegisterDeviceRequest }
    >({
      query: ({ userId, deviceData }) => ({
        url: `/notifications/register-device/${userId}`,
        method: 'POST',
        body: deviceData,
      }),
    }),

    unregisterDevice: builder.mutation<
      void,
      { userId: string; deviceId: string }
    >({
      query: ({ userId, deviceId }) => ({
        url: `/notifications/device/${userId}/${deviceId}`,
        method: 'DELETE',
      }),
    }),

    sendTestNotification: builder.mutation<void, string>({
      query: userId => ({
        url: `/notifications/test/${userId}`,
        method: 'POST',
      }),
    }),

    // Notification History
    getNotificationHistory: builder.query<
      NotificationHistory[],
      { userId: string; limit?: number }
    >({
      query: ({ userId, limit = 50 }) => ({
        url: `/notifications/history/${userId}`,
        params: { limit },
      }),
      providesTags: (result, error, { userId }) => [
        { type: 'NotificationHistory', id: userId },
      ],
    }),

    // Admin/Debug endpoints
    getDeviceStats: builder.query<any, void>({
      query: () => '/notifications/stats/devices',
    }),

    getPriceStats: builder.query<any, void>({
      query: () => '/notifications/stats/prices',
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetUserPriceAlertsQuery,
  useCreatePriceAlertMutation,
  useUpdatePriceAlertMutation,
  useDeletePriceAlertMutation,
  useTogglePriceAlertMutation,
  useRegisterDeviceMutation,
  useUnregisterDeviceMutation,
  useSendTestNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetDeviceStatsQuery,
  useGetPriceStatsQuery,
} = notificationsApi;
