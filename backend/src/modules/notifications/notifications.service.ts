import { Injectable, Logger } from '@nestjs/common';
import { PriceAlertService } from './price-alert.service';
import { PushNotificationService } from './push-notification.service';
import {
  CreatePriceAlertDto,
  PriceAlert,
  NotificationPreferences,
} from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private userPreferences = new Map<string, NotificationPreferences>();
  private priceAlerts = new Map<string, PriceAlert[]>();

  constructor(
    private priceAlertService: PriceAlertService,
    private pushNotificationService: PushNotificationService
  ) {
    this.logger.debug('NotificationsService initialized');
  }

  // User preference management
  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    this.userPreferences.set(userId, preferences);
    this.logger.debug(`Updated preferences for user ${userId}`);
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    return (
      this.userPreferences.get(userId) || {
        pushNotificationsEnabled: true,
        priceAlertsEnabled: true,
        transactionNotificationsEnabled: true,
        portfolioUpdatesEnabled: false,
        marketNewsEnabled: false,
      }
    );
  }

  // Price alerts management
  async createPriceAlert(
    userId: string,
    alertData: CreatePriceAlertDto
  ): Promise<PriceAlert> {
    const alert = await this.priceAlertService.createAlert(userId, alertData);

    const userAlerts = this.priceAlerts.get(userId) || [];
    userAlerts.push(alert);
    this.priceAlerts.set(userId, userAlerts);

    this.logger.debug(
      `Created price alert for user ${userId}: ${alert.tokenSymbol}`
    );
    return alert;
  }

  async getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
    return this.priceAlerts.get(userId) || [];
  }

  async deletePriceAlert(userId: string, alertId: string): Promise<void> {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const filteredAlerts = userAlerts.filter((alert) => alert.id !== alertId);
    this.priceAlerts.set(userId, filteredAlerts);

    await this.priceAlertService.deleteAlert(alertId);
    this.logger.debug(`Deleted price alert ${alertId} for user ${userId}`);
  }

  async togglePriceAlert(userId: string, alertId: string): Promise<PriceAlert> {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const alert = userAlerts.find((a) => a.id === alertId);

    if (!alert) {
      throw new Error('Price alert not found');
    }

    alert.isActive = !alert.isActive;
    await this.priceAlertService.updateAlert(alert);

    this.logger.debug(
      `Toggled price alert ${alertId} to ${alert.isActive ? 'active' : 'inactive'}`
    );
    return alert;
  }

  // Notification sending
  async sendPriceAlert(
    userId: string,
    alert: PriceAlert,
    currentPrice: number
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);

    if (
      !preferences.pushNotificationsEnabled ||
      !preferences.priceAlertsEnabled
    ) {
      return;
    }

    const message = this.formatPriceAlertMessage(alert, currentPrice);
    await this.pushNotificationService.sendNotification(userId, {
      title: 'Price Alert Triggered',
      body: message,
      data: {
        type: 'price_alert',
        alertId: alert.id,
        tokenSymbol: alert.tokenSymbol,
        currentPrice: currentPrice.toString(),
      },
    });

    this.logger.debug(`Sent price alert notification to user ${userId}`);
  }

  async sendTransactionNotification(
    userId: string,
    transactionHash: string,
    status: 'confirmed' | 'failed',
    network: string
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);

    if (
      !preferences.pushNotificationsEnabled ||
      !preferences.transactionNotificationsEnabled
    ) {
      return;
    }

    const message =
      status === 'confirmed'
        ? 'Your transaction has been confirmed!'
        : 'Your transaction has failed. Please try again.';

    await this.pushNotificationService.sendNotification(userId, {
      title: 'Transaction Update',
      body: message,
      data: {
        type: 'transaction',
        transactionHash,
        status,
        network,
      },
    });

    this.logger.debug(
      `Sent transaction notification to user ${userId}: ${status}`
    );
  }

  async sendPortfolioUpdate(
    userId: string,
    portfolioChange: number,
    timeframe: '24h' | '7d'
  ): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);

    if (
      !preferences.pushNotificationsEnabled ||
      !preferences.portfolioUpdatesEnabled
    ) {
      return;
    }

    const changePercent = (portfolioChange * 100).toFixed(2);
    const direction = portfolioChange >= 0 ? 'up' : 'down';
    const emoji = portfolioChange >= 0 ? '📈' : '📉';

    const message = `Your portfolio is ${direction} ${Math.abs(parseFloat(changePercent))}% over the last ${timeframe}`;

    await this.pushNotificationService.sendNotification(userId, {
      title: `${emoji} Portfolio Update`,
      body: message,
      data: {
        type: 'portfolio_update',
        change: portfolioChange.toString(),
        timeframe,
      },
    });

    this.logger.debug(
      `Sent portfolio update to user ${userId}: ${changePercent}%`
    );
  }

  private formatPriceAlertMessage(
    alert: PriceAlert,
    currentPrice: number
  ): string {
    const direction =
      alert.condition === 'above' ? 'risen above' : 'fallen below';
    const currency = alert.currency || 'USD';

    return `${alert.tokenSymbol} has ${direction} $${alert.targetPrice.toFixed(2)} ${currency}. Current price: $${currentPrice.toFixed(2)}`;
  }

  // Get notification history (for UI)
  async getNotificationHistory(userId: string, limit = 50): Promise<any[]> {
    // In a real app, this would fetch from database
    // For now, return empty array as placeholder
    return [];
  }
}
