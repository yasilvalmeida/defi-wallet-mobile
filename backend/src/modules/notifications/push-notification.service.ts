import { Injectable, Logger } from '@nestjs/common';
import {
  PushNotificationDto,
  RegisterPushTokenDto,
} from './dto/notifications.dto';

interface UserDevice {
  userId: string;
  deviceId: string;
  pushToken: string;
  platform: 'ios' | 'android';
  registeredAt: Date;
  isActive: boolean;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private userDevices = new Map<string, UserDevice[]>(); // userId -> devices[]
  private deviceTokens = new Map<string, string>(); // deviceId -> pushToken

  constructor() {
    this.logger.debug('PushNotificationService initialized');
  }

  // Register device for push notifications
  async registerDevice(
    userId: string,
    deviceData: RegisterPushTokenDto
  ): Promise<void> {
    const device: UserDevice = {
      userId,
      deviceId: deviceData.deviceId,
      pushToken: deviceData.pushToken,
      platform: deviceData.platform,
      registeredAt: new Date(),
      isActive: true,
    };

    // Store device for user
    const userDevices = this.userDevices.get(userId) || [];

    // Remove existing device with same deviceId
    const filteredDevices = userDevices.filter(
      (d) => d.deviceId !== deviceData.deviceId
    );
    filteredDevices.push(device);

    this.userDevices.set(userId, filteredDevices);
    this.deviceTokens.set(deviceData.deviceId, deviceData.pushToken);

    this.logger.debug(
      `Registered ${deviceData.platform} device for user ${userId}`
    );
  }

  // Unregister device
  async unregisterDevice(userId: string, deviceId: string): Promise<void> {
    const userDevices = this.userDevices.get(userId) || [];
    const filteredDevices = userDevices.filter((d) => d.deviceId !== deviceId);

    this.userDevices.set(userId, filteredDevices);
    this.deviceTokens.delete(deviceId);

    this.logger.debug(`Unregistered device ${deviceId} for user ${userId}`);
  }

  // Send notification to specific user
  async sendNotification(
    userId: string,
    notification: PushNotificationDto
  ): Promise<void> {
    const userDevices = this.userDevices.get(userId) || [];
    const activeDevices = userDevices.filter((device) => device.isActive);

    if (activeDevices.length === 0) {
      this.logger.warn(`No active devices found for user ${userId}`);
      return;
    }

    this.logger.debug(
      `Sending notification to ${activeDevices.length} devices for user ${userId}`
    );

    // Send to all user's active devices
    for (const device of activeDevices) {
      try {
        await this.sendToDevice(device, notification);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to send notification to device ${device.deviceId}: ${errorMessage}`
        );

        // Mark device as inactive if token is invalid
        if (errorMessage.includes('invalid token')) {
          device.isActive = false;
        }
      }
    }
  }

  // Send notification to multiple users
  async sendBulkNotification(
    userIds: string[],
    notification: PushNotificationDto
  ): Promise<void> {
    this.logger.debug(`Sending bulk notification to ${userIds.length} users`);

    for (const userId of userIds) {
      try {
        await this.sendNotification(userId, notification);
      } catch (error) {
        this.logger.error(
          `Failed to send notification to user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  // Send to specific device
  private async sendToDevice(
    device: UserDevice,
    notification: PushNotificationDto
  ): Promise<void> {
    // In a real implementation, this would use Firebase Cloud Messaging (FCM) for Android
    // and Apple Push Notification Service (APNS) for iOS

    this.logger.debug(
      `[MOCK] Sending ${device.platform} notification to ${device.deviceId}`
    );
    this.logger.debug(`Title: ${notification.title}`);
    this.logger.debug(`Body: ${notification.body}`);

    if (notification.data) {
      this.logger.debug(`Data: ${JSON.stringify(notification.data)}`);
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock success/failure (95% success rate)
    if (Math.random() < 0.95) {
      this.logger.debug(
        `✅ Notification sent successfully to ${device.deviceId}`
      );
    } else {
      throw new Error('Network error - failed to send notification');
    }
  }

  // Firebase Cloud Messaging implementation (placeholder)
  private async sendFCMNotification(
    token: string,
    notification: PushNotificationDto
  ): Promise<void> {
    // This would use the Firebase Admin SDK
    // import * as admin from 'firebase-admin';

    /*
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      token: token,
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        notification: {
          sound: notification.sound || 'default',
          priority: notification.priority === 'high' ? 'high' : 'default',
        },
      },
    };

    const response = await admin.messaging().send(message);
    this.logger.debug(`FCM response: ${response}`);
    */

    this.logger.debug(
      `[MOCK] FCM notification sent to token: ${token.substring(0, 10)}...`
    );
  }

  // Apple Push Notification Service implementation (placeholder)
  private async sendAPNSNotification(
    token: string,
    notification: PushNotificationDto
  ): Promise<void> {
    // This would use the node-apn library or HTTP/2 API

    /*
    const apnPayload = {
      aps: {
        alert: {
          title: notification.title,
          body: notification.body,
        },
        sound: notification.sound || 'default',
        badge: 1,
      },
      ...notification.data,
    };

    // Send via APNS
    */

    this.logger.debug(
      `[MOCK] APNS notification sent to token: ${token.substring(0, 10)}...`
    );
  }

  // Get user devices for debugging
  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return this.userDevices.get(userId) || [];
  }

  // Get all registered devices count
  async getDeviceStats(): Promise<{
    totalDevices: number;
    activeDevices: number;
    iosDevices: number;
    androidDevices: number;
  }> {
    let totalDevices = 0;
    let activeDevices = 0;
    let iosDevices = 0;
    let androidDevices = 0;

    for (const devices of this.userDevices.values()) {
      for (const device of devices) {
        totalDevices++;
        if (device.isActive) {
          activeDevices++;
        }
        if (device.platform === 'ios') {
          iosDevices++;
        } else {
          androidDevices++;
        }
      }
    }

    return {
      totalDevices,
      activeDevices,
      iosDevices,
      androidDevices,
    };
  }

  // Test notification for debugging
  async sendTestNotification(userId: string): Promise<void> {
    await this.sendNotification(userId, {
      title: '🧪 Test Notification',
      body: 'This is a test notification from your DeFi Wallet app!',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      priority: 'normal',
    });
  }
}
