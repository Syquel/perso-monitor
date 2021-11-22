import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { WebMonModule } from './web-mon/web-mon.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OpsModule } from './ops/ops.module';

const CONFIG_FILE_PATH = 'config.json';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [
        (): Record<string, unknown> => {
          console.debug('Path: ' + __dirname);
          const configFilePath: string = path.resolve(__dirname, CONFIG_FILE_PATH);
          const rawConfig: string = fs.readFileSync(configFilePath, 'utf-8');
          return JSON.parse(rawConfig) as Record<string, unknown>;
        }
      ]
    }),
    OpsModule,
    NotificationModule,
    WebMonModule
  ]
})
export class AppModule {}
