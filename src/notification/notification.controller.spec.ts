import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { ValueProvider } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { createMock } from '@golevelup/ts-jest';
import { mocked, MockedObject } from 'ts-jest/dist/utils/testing';
import { of } from 'rxjs';

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockService: MockedObject<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationController,
        {
          provide: NotificationService,
          useValue: createMock<NotificationService>()
        } as ValueProvider<NotificationService>
      ]
    }).compile();

    mockService = mocked(module.get(NotificationService));
    controller = module.get(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('startup notification should trigger notification', () => {
    mockService.notify.mockImplementation(() => of(void 0));

    controller.triggerStartupNotification();

    expect(mockService.notify).toHaveBeenCalledTimes(1);
  });
  it('periodic notification should trigger notification', () => {
    mockService.notify.mockImplementation(() => of(void 0));

    controller.triggerPeriodicNotification();

    expect(mockService.notify).toHaveBeenCalledTimes(1);
  });
});
