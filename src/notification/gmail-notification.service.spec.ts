import { Test, TestingModule } from '@nestjs/testing';
import { GmailNotificationService } from './gmail-notification.service';
import { ConfigModule } from '@nestjs/config';

describe('GmailNotificationService', () => {
  let service: GmailNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, ignoreEnvVars: false, isGlobal: false })
      ],
      providers: [
        GmailNotificationService
      ]
    }).compile();

    service = module.get<GmailNotificationService>(GmailNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
