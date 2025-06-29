import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceAlertDto {
  @ApiProperty({ description: 'Token symbol (e.g., BTC, ETH, SOL)' })
  @IsString()
  tokenSymbol: string;

  @ApiProperty({ description: 'Alert condition', enum: ['above', 'below'] })
  @IsEnum(['above', 'below'])
  condition: 'above' | 'below';

  @ApiProperty({ description: 'Target price to trigger alert', minimum: 0 })
  @IsNumber()
  @Min(0)
  targetPrice: number;

  @ApiProperty({ description: 'Currency for price comparison', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Network where token exists',
    enum: ['solana', 'ethereum'],
  })
  @IsEnum(['solana', 'ethereum'])
  network: 'solana' | 'ethereum';

  @ApiProperty({ description: 'Token contract address', required: false })
  @IsOptional()
  @IsString()
  tokenAddress?: string;
}

export class UpdatePriceAlertDto {
  @ApiProperty({
    description: 'Alert condition',
    enum: ['above', 'below'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['above', 'below'])
  condition?: 'above' | 'below';

  @ApiProperty({
    description: 'Target price to trigger alert',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPrice?: number;

  @ApiProperty({ description: 'Whether the alert is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class NotificationPreferences {
  @ApiProperty({ description: 'Enable push notifications' })
  @IsBoolean()
  pushNotificationsEnabled: boolean;

  @ApiProperty({ description: 'Enable price alerts' })
  @IsBoolean()
  priceAlertsEnabled: boolean;

  @ApiProperty({ description: 'Enable transaction notifications' })
  @IsBoolean()
  transactionNotificationsEnabled: boolean;

  @ApiProperty({ description: 'Enable portfolio update notifications' })
  @IsBoolean()
  portfolioUpdatesEnabled: boolean;

  @ApiProperty({ description: 'Enable market news notifications' })
  @IsBoolean()
  marketNewsEnabled: boolean;
}

export class PriceAlert {
  @ApiProperty({ description: 'Unique alert ID' })
  id: string;

  @ApiProperty({ description: 'User ID who owns this alert' })
  userId: string;

  @ApiProperty({ description: 'Token symbol' })
  tokenSymbol: string;

  @ApiProperty({ description: 'Alert condition' })
  condition: 'above' | 'below';

  @ApiProperty({ description: 'Target price' })
  targetPrice: number;

  @ApiProperty({ description: 'Current token price' })
  currentPrice: number;

  @ApiProperty({ description: 'Currency for price comparison' })
  currency: string;

  @ApiProperty({ description: 'Network where token exists' })
  network: 'solana' | 'ethereum';

  @ApiProperty({ description: 'Token contract address' })
  tokenAddress?: string;

  @ApiProperty({ description: 'Whether the alert is active' })
  isActive: boolean;

  @ApiProperty({ description: 'When the alert was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the alert was last triggered' })
  lastTriggeredAt?: Date;

  @ApiProperty({ description: 'How many times the alert has been triggered' })
  triggerCount: number;
}

export class PushNotificationDto {
  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body message' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Additional notification data' })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Notification priority',
    enum: ['normal', 'high'],
    default: 'normal',
  })
  @IsOptional()
  @IsEnum(['normal', 'high'])
  priority?: 'normal' | 'high';

  @ApiProperty({ description: 'Custom notification sound', required: false })
  @IsOptional()
  @IsString()
  sound?: string;
}

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'FCM/APNS push token' })
  @IsString()
  pushToken: string;

  @ApiProperty({ description: 'Device platform', enum: ['ios', 'android'] })
  @IsEnum(['ios', 'android'])
  platform: 'ios' | 'android';

  @ApiProperty({ description: 'Device identifier' })
  @IsString()
  deviceId: string;
}

export class NotificationHistoryDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'Notification type' })
  type: 'price_alert' | 'transaction' | 'portfolio_update' | 'market_news';

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({ description: 'When notification was sent' })
  sentAt: Date;

  @ApiProperty({ description: 'Whether notification was read' })
  isRead: boolean;

  @ApiProperty({ description: 'Additional notification data' })
  data?: Record<string, any>;
}
