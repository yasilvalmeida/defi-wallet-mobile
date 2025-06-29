import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterDeviceMutation } from '../store/api/notificationsApi';

export interface NotificationData {
  type:
    | 'price_alert'
    | 'transaction'
    | 'portfolio_update'
    | 'market_news'
    | 'test';
  alertId?: string;
  tokenSymbol?: string;
  currentPrice?: string;
  transactionHash?: string;
  status?: string;
  network?: string;
  change?: string;
  timeframe?: string;
  timestamp?: string;
}

export interface RemoteMessage {
  messageId: string;
  title?: string;
  body?: string;
  data?: NotificationData;
  sentTime?: number;
}

class NotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;
  private deviceId: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);

      // Generate device ID
      this.deviceId = await this.getDeviceId();

      // Set up message handlers
      this.setupMessageHandlers();

      this.isInitialized = true;
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Allow DeFi Wallet to send you price alerts and updates?',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `${Platform.OS}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `${Platform.OS}-${Date.now()}`;
    }
  }

  private setupMessageHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      this.handleBackgroundMessage(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Message handled in the foreground!', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
      this.handleNotificationOpened(remoteMessage);
    });

    // Handle app opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          this.handleNotificationOpened(remoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      this.fcmToken = token;
      this.updateDeviceToken(token);
    });
  }

  private handleBackgroundMessage(remoteMessage: any): void {
    // Handle background notification
    console.log('Background message data:', remoteMessage.data);

    // Store notification for later processing
    this.storeNotification(remoteMessage);
  }

  private handleForegroundMessage(remoteMessage: any): void {
    // Show in-app notification
    const { notification, data } = remoteMessage;

    Alert.alert(
      notification.title || 'DeFi Wallet',
      notification.body || 'You have a new notification',
      [
        { text: 'Dismiss', style: 'cancel' },
        {
          text: 'View',
          onPress: () => this.handleNotificationOpened(remoteMessage),
        },
      ],
    );
  }

  private handleNotificationOpened(remoteMessage: any): void {
    const { data } = remoteMessage;
    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'price_alert':
        // Navigate to price alerts screen
        this.navigateToScreen('PriceAlerts', { alertId: data.alertId });
        break;
      case 'transaction':
        // Navigate to transaction details
        this.navigateToScreen('TransactionDetails', {
          transactionHash: data.transactionHash,
          network: data.network,
        });
        break;
      case 'portfolio_update':
        // Navigate to portfolio screen
        this.navigateToScreen('Portfolio');
        break;
      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  private navigateToScreen(screenName: string, params?: any): void {
    // This would integrate with your navigation system
    console.log(`Navigate to ${screenName}`, params);
    // Example: NavigationService.navigate(screenName, params);
  }

  private async storeNotification(remoteMessage: any): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.unshift({
        ...remoteMessage,
        receivedAt: Date.now(),
        isRead: false,
      });

      // Keep only last 100 notifications
      const trimmedNotifications = notifications.slice(0, 100);

      await AsyncStorage.setItem(
        'notifications',
        JSON.stringify(trimmedNotifications),
      );
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  private async getStoredNotifications(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  private async updateDeviceToken(token: string): Promise<void> {
    // Update token on backend
    // This would typically be called when the user is logged in
    console.log('Token updated, should sync with backend:', token);
  }

  // Public methods
  async registerDevice(userId: string): Promise<void> {
    if (!this.fcmToken || !this.deviceId) {
      throw new Error('NotificationService not initialized');
    }

    try {
      // Register device with backend
      const registerDevice = useRegisterDeviceMutation();
      // Note: In a real app, you'd call this from a React component
      // registerDevice({
      //   userId,
      //   deviceData: {
      //     pushToken: this.fcmToken,
      //     platform: Platform.OS as 'ios' | 'android',
      //     deviceId: this.deviceId,
      //   }
      // });

      console.log('Device registered for user:', userId);
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  async unregisterDevice(userId: string): Promise<void> {
    if (!this.deviceId) {
      throw new Error('Device ID not available');
    }

    try {
      // Unregister device from backend
      console.log('Device unregistered for user:', userId);
    } catch (error) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  getDeviceId(): string | null {
    return this.deviceId;
  }

  async clearStoredNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getNotificationHistory(): Promise<any[]> {
    return this.getStoredNotifications();
  }
}

export default new NotificationService();
