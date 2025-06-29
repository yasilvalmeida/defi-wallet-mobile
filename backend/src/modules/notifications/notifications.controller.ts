import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PriceAlertService } from './price-alert.service';
import { PushNotificationService } from './push-notification.service';
import {
  CreatePriceAlertDto,
  UpdatePriceAlertDto,
  NotificationPreferences,
  PriceAlert,
  RegisterPushTokenDto,
  PushNotificationDto,
  NotificationHistoryDto,
} from './dto/notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private priceAlertService: PriceAlertService,
    private pushNotificationService: PushNotificationService
  ) {}

  // Notification Preferences
  @Get('preferences/:userId')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved',
    type: NotificationPreferences,
  })
  async getNotificationPreferences(
    @Param('userId') userId: string
  ): Promise<NotificationPreferences> {
    return this.notificationsService.getNotificationPreferences(userId);
  }

  @Put('preferences/:userId')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body() preferences: NotificationPreferences
  ): Promise<void> {
    return this.notificationsService.updateNotificationPreferences(
      userId,
      preferences
    );
  }

  // Price Alerts Management
  @Get('price-alerts/:userId')
  @ApiOperation({ summary: 'Get user price alerts' })
  @ApiResponse({
    status: 200,
    description: 'Price alerts retrieved',
    type: [PriceAlert],
  })
  async getUserPriceAlerts(
    @Param('userId') userId: string
  ): Promise<PriceAlert[]> {
    return this.notificationsService.getUserPriceAlerts(userId);
  }

  @Post('price-alerts/:userId')
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiResponse({
    status: 201,
    description: 'Price alert created',
    type: PriceAlert,
  })
  async createPriceAlert(
    @Param('userId') userId: string,
    @Body() alertData: CreatePriceAlertDto
  ): Promise<PriceAlert> {
    return this.notificationsService.createPriceAlert(userId, alertData);
  }

  @Put('price-alerts/:userId/:alertId')
  @ApiOperation({ summary: 'Update a price alert' })
  @ApiResponse({
    status: 200,
    description: 'Price alert updated',
    type: PriceAlert,
  })
  async updatePriceAlert(
    @Param('userId') userId: string,
    @Param('alertId') alertId: string,
    @Body() updateData: UpdatePriceAlertDto
  ): Promise<PriceAlert> {
    const alert = await this.priceAlertService.getAlert(alertId);
    if (!alert || alert.userId !== userId) {
      throw new Error('Price alert not found');
    }

    // Update alert properties
    if (updateData.condition !== undefined) {
      alert.condition = updateData.condition;
    }
    if (updateData.targetPrice !== undefined) {
      alert.targetPrice = updateData.targetPrice;
    }
    if (updateData.isActive !== undefined) {
      alert.isActive = updateData.isActive;
    }

    return this.priceAlertService.updateAlert(alert);
  }

  @Delete('price-alerts/:userId/:alertId')
  @ApiOperation({ summary: 'Delete a price alert' })
  @ApiResponse({ status: 200, description: 'Price alert deleted' })
  @HttpCode(HttpStatus.OK)
  async deletePriceAlert(
    @Param('userId') userId: string,
    @Param('alertId') alertId: string
  ): Promise<void> {
    return this.notificationsService.deletePriceAlert(userId, alertId);
  }

  @Post('price-alerts/:userId/:alertId/toggle')
  @ApiOperation({ summary: 'Toggle price alert active status' })
  @ApiResponse({
    status: 200,
    description: 'Price alert toggled',
    type: PriceAlert,
  })
  async togglePriceAlert(
    @Param('userId') userId: string,
    @Param('alertId') alertId: string
  ): Promise<PriceAlert> {
    return this.notificationsService.togglePriceAlert(userId, alertId);
  }

  // Push Notifications
  @Post('register-device/:userId')
  @ApiOperation({ summary: 'Register device for push notifications' })
  @ApiResponse({ status: 201, description: 'Device registered successfully' })
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(
    @Param('userId') userId: string,
    @Body() deviceData: RegisterPushTokenDto
  ): Promise<void> {
    return this.pushNotificationService.registerDevice(userId, deviceData);
  }

  @Delete('device/:userId/:deviceId')
  @ApiOperation({ summary: 'Unregister device from push notifications' })
  @ApiResponse({ status: 200, description: 'Device unregistered successfully' })
  @HttpCode(HttpStatus.OK)
  async unregisterDevice(
    @Param('userId') userId: string,
    @Param('deviceId') deviceId: string
  ): Promise<void> {
    return this.pushNotificationService.unregisterDevice(userId, deviceId);
  }

  @Post('send/:userId')
  @ApiOperation({ summary: 'Send notification to user (for testing)' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @HttpCode(HttpStatus.OK)
  async sendNotification(
    @Param('userId') userId: string,
    @Body() notification: PushNotificationDto
  ): Promise<void> {
    return this.pushNotificationService.sendNotification(userId, notification);
  }

  @Post('test/:userId')
  @ApiOperation({ summary: 'Send test notification to user' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(@Param('userId') userId: string): Promise<void> {
    return this.pushNotificationService.sendTestNotification(userId);
  }

  // Notification History
  @Get('history/:userId')
  @ApiOperation({ summary: 'Get notification history for user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of notifications to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved',
    type: [NotificationHistoryDto],
  })
  async getNotificationHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ): Promise<NotificationHistoryDto[]> {
    return this.notificationsService.getNotificationHistory(userId, limit);
  }

  // Admin/Debug Endpoints
  @Get('stats/devices')
  @ApiOperation({ summary: 'Get device registration statistics' })
  @ApiResponse({ status: 200, description: 'Device statistics retrieved' })
  async getDeviceStats(): Promise<any> {
    return this.pushNotificationService.getDeviceStats();
  }

  @Get('stats/prices')
  @ApiOperation({ summary: 'Get price monitoring statistics' })
  @ApiResponse({ status: 200, description: 'Price statistics retrieved' })
  async getPriceStats(): Promise<any> {
    return this.priceAlertService.getPriceStatistics();
  }

  @Post('alerts/:alertId/check')
  @ApiOperation({
    summary: 'Manually check specific price alert (for testing)',
  })
  @ApiResponse({ status: 200, description: 'Price alert checked' })
  async checkPriceAlert(@Param('alertId') alertId: string): Promise<any> {
    return this.priceAlertService.checkSpecificAlert(alertId);
  }
}
