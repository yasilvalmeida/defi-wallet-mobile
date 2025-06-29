import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PriceAlertService } from './price-alert.service';
import { PushNotificationService } from './push-notification.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService, PriceAlertService, PushNotificationService],
  exports: [NotificationsService, PriceAlertService],
})
export class NotificationsModule {}
