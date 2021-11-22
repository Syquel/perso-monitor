import { Module } from '@nestjs/common';
import { WebMonController } from './web-mon.controller';
import { WebMonService } from './web-mon.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule,
        HttpModule,
        NotificationModule,
        ScheduleModule
    ],
    providers: [
        WebMonController,
        WebMonService
    ]
})
export class WebMonModule {}
