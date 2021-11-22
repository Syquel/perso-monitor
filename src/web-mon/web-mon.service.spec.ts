import { Test, TestingModule } from '@nestjs/testing';
import { WebMonService } from './web-mon.service';
import { ClassProvider, ValueProvider } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createMock } from '@golevelup/ts-jest';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';

describe('WebMonService', () => {
  let service: WebMonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
          ConfigModule.forRoot({ ignoreEnvFile: true, ignoreEnvVars: false, isGlobal: false })
      ],
      providers: [
        WebMonService,
        {
          provide: HttpService,
          useValue: createMock<HttpService>()
        } as ValueProvider<HttpService>,
        {
          provide: NotificationService,
          useClass: createMock(NotificationService)
        } as ClassProvider<NotificationService>
      ]
    }).compile();

    service = module.get<WebMonService>(WebMonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
