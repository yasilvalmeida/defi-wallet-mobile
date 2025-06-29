import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  CreatePriceAlertDto,
  PriceAlert,
  UpdatePriceAlertDto,
} from './dto/notifications.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PriceAlertService {
  private readonly logger = new Logger(PriceAlertService.name);
  private alerts = new Map<string, PriceAlert>();
  private priceCache = new Map<string, { price: number; lastUpdated: Date }>();

  constructor() {
    this.logger.debug('PriceAlertService initialized');
  }

  async createAlert(
    userId: string,
    alertData: CreatePriceAlertDto
  ): Promise<PriceAlert> {
    const alert: PriceAlert = {
      id: uuidv4(),
      userId,
      tokenSymbol: alertData.tokenSymbol.toUpperCase(),
      condition: alertData.condition,
      targetPrice: alertData.targetPrice,
      currentPrice: 0,
      currency: alertData.currency || 'USD',
      network: alertData.network,
      tokenAddress: alertData.tokenAddress,
      isActive: true,
      createdAt: new Date(),
      lastTriggeredAt: undefined,
      triggerCount: 0,
    };

    // Get current price for the token
    try {
      const currentPrice = await this.getCurrentPrice(alert.tokenSymbol);
      alert.currentPrice = currentPrice;
    } catch (error) {
      this.logger.warn(
        `Failed to get current price for ${alert.tokenSymbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    this.alerts.set(alert.id, alert);
    this.logger.debug(
      `Created price alert: ${alert.tokenSymbol} ${alert.condition} $${alert.targetPrice}`
    );

    return alert;
  }

  async updateAlert(alert: PriceAlert): Promise<PriceAlert> {
    this.alerts.set(alert.id, alert);
    this.logger.debug(`Updated price alert: ${alert.id}`);
    return alert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    this.alerts.delete(alertId);
    this.logger.debug(`Deleted price alert: ${alertId}`);
  }

  async getAlert(alertId: string): Promise<PriceAlert | undefined> {
    return this.alerts.get(alertId);
  }

  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.userId === userId
    );
  }

  async getAllActiveAlerts(): Promise<PriceAlert[]> {
    return Array.from(this.alerts.values()).filter((alert) => alert.isActive);
  }

  // Background job to check prices every 30 seconds
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkPriceAlerts(): Promise<void> {
    const activeAlerts = await this.getAllActiveAlerts();

    if (activeAlerts.length === 0) {
      return;
    }

    this.logger.debug(`Checking ${activeAlerts.length} active price alerts`);

    // Group alerts by token symbol to minimize API calls
    const alertsByToken = new Map<string, PriceAlert[]>();
    activeAlerts.forEach((alert) => {
      const alerts = alertsByToken.get(alert.tokenSymbol) || [];
      alerts.push(alert);
      alertsByToken.set(alert.tokenSymbol, alerts);
    });

    // Check each token
    for (const [tokenSymbol, tokenAlerts] of alertsByToken) {
      try {
        const currentPrice = await this.getCurrentPrice(tokenSymbol);
        await this.processTokenAlerts(tokenAlerts, currentPrice);
      } catch (error) {
        this.logger.error(
          `Failed to check price for ${tokenSymbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  private async processTokenAlerts(
    alerts: PriceAlert[],
    currentPrice: number
  ): Promise<void> {
    for (const alert of alerts) {
      const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

      if (shouldTrigger) {
        await this.triggerAlert(alert, currentPrice);
      }

      // Update current price
      alert.currentPrice = currentPrice;
      await this.updateAlert(alert);
    }
  }

  private shouldTriggerAlert(alert: PriceAlert, currentPrice: number): boolean {
    if (!alert.isActive) {
      return false;
    }

    const timeSinceLastTrigger = alert.lastTriggeredAt
      ? Date.now() - alert.lastTriggeredAt.getTime()
      : Infinity;

    // Don't trigger again within 5 minutes to avoid spam
    const MIN_TRIGGER_INTERVAL = 5 * 60 * 1000; // 5 minutes
    if (timeSinceLastTrigger < MIN_TRIGGER_INTERVAL) {
      return false;
    }

    if (alert.condition === 'above') {
      return currentPrice >= alert.targetPrice;
    } else {
      return currentPrice <= alert.targetPrice;
    }
  }

  private async triggerAlert(
    alert: PriceAlert,
    currentPrice: number
  ): Promise<void> {
    this.logger.debug(
      `Triggering alert: ${alert.tokenSymbol} is ${alert.condition} $${alert.targetPrice}`
    );

    alert.lastTriggeredAt = new Date();
    alert.triggerCount += 1;

    // Here we would typically:
    // 1. Send push notification via NotificationsService
    // 2. Store notification in database for history
    // 3. Update alert statistics

    // For now, just log the trigger
    this.logger.debug(
      `Alert triggered: ${alert.tokenSymbol} ${alert.condition} $${alert.targetPrice} (current: $${currentPrice})`
    );
  }

  private async getCurrentPrice(tokenSymbol: string): Promise<number> {
    // Check cache first
    const cached = this.priceCache.get(tokenSymbol);
    const CACHE_DURATION = 30 * 1000; // 30 seconds

    if (cached && Date.now() - cached.lastUpdated.getTime() < CACHE_DURATION) {
      return cached.price;
    }

    // Simulate API call to price service
    // In a real implementation, this would call CoinGecko, CoinMarketCap, or your price API
    const mockPrices: Record<string, number> = {
      BTC: 45000 + Math.random() * 1000,
      ETH: 2800 + Math.random() * 200,
      SOL: 100 + Math.random() * 20,
      USDC: 1,
      USDT: 1,
      MATIC: 0.8 + Math.random() * 0.2,
      AVAX: 25 + Math.random() * 5,
      LINK: 15 + Math.random() * 3,
      DOT: 6 + Math.random() * 2,
      ADA: 0.5 + Math.random() * 0.1,
    };

    const price = mockPrices[tokenSymbol] || Math.random() * 100;

    // Cache the price
    this.priceCache.set(tokenSymbol, {
      price,
      lastUpdated: new Date(),
    });

    return price;
  }

  // Manual price check for testing
  async checkSpecificAlert(
    alertId: string
  ): Promise<{ alert: PriceAlert; triggered: boolean }> {
    const alert = await this.getAlert(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    const currentPrice = await this.getCurrentPrice(alert.tokenSymbol);
    const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

    if (shouldTrigger) {
      await this.triggerAlert(alert, currentPrice);
    }

    alert.currentPrice = currentPrice;
    await this.updateAlert(alert);

    return {
      alert,
      triggered: shouldTrigger,
    };
  }

  // Get price statistics for debugging
  async getPriceStatistics(): Promise<Record<string, any>> {
    const cacheEntries = Array.from(this.priceCache.entries());
    const stats = {
      cachedTokens: cacheEntries.length,
      activeAlerts: await this.getAllActiveAlerts().then(
        (alerts) => alerts.length
      ),
      priceData: Object.fromEntries(cacheEntries),
    };

    return stats;
  }
}
