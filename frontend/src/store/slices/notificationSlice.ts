import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isVisible: boolean;
  currentNotification?: Notification;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isVisible: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Keep only last 100 notifications
      state.notifications = state.notifications.slice(0, 100);
      
      // Show notification if not persistent
      if (!notification.persistent) {
        state.currentNotification = notification;
        state.isVisible = true;
      }
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index >= 0) {
        const notification = state.notifications[index];
        state.notifications.splice(index, 1);
        
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    showNotification: (state, action: PayloadAction<Notification>) => {
      state.currentNotification = action.payload;
      state.isVisible = true;
    },
    
    hideNotification: (state) => {
      state.isVisible = false;
      state.currentNotification = undefined;
    },
    
    // Helper actions for common notification types
    showSuccess: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        timestamp: new Date(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      state.currentNotification = notification;
      state.isVisible = true;
    },
    
    showError: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'error',
        timestamp: new Date(),
        read: false,
        persistent: true,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      state.currentNotification = notification;
      state.isVisible = true;
    },
    
    showWarning: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'warning',
        timestamp: new Date(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      state.currentNotification = notification;
      state.isVisible = true;
    },
    
    showInfo: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'info',
        timestamp: new Date(),
        read: false,
        ...action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      state.currentNotification = notification;
      state.isVisible = true;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  showNotification,
  hideNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} = notificationSlice.actions;

export default notificationSlice.reducer; 