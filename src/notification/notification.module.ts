import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationProviderName, NotificationService, NotificationSettings } from './notification.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DummyNotificationService } from './dummy-notification.service';
import { GmailNotificationService, GmailNotificationSettings } from './gmail-notification.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule
    ],
    providers: [
        NotificationController,
        {
            provide: NotificationService,
            inject: [ ConfigService ],
            useFactory: (configService: ConfigService<NotificationSettings<NotificationProviderName, unknown>>): NotificationService => {
                const providerName: NotificationProviderName = configService.get('notification.provider', 'dummy', { infer: true });
                switch (providerName) {
                    case 'dummy': return new DummyNotificationService();
                    case 'gmail': return new GmailNotificationService(configService as ConfigService<GmailNotificationSettings>);
                }
            }
        }
    ],
    exports: [ NotificationService ]
})
export class NotificationModule {}
