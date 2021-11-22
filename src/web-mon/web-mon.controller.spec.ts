import { Test, TestingModule } from '@nestjs/testing';
import { WebMonController } from './web-mon.controller';
import { WebMonService } from './web-mon.service';
import { mocked, MockedObject } from 'ts-jest/dist/utils/testing';
import { ValueProvider } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('WebMonController', () => {
  let controller: WebMonController;
  let mockService: MockedObject<WebMonService>;

  beforeEach(async () => {
    const module: TestingModule =
        await Test
            .createTestingModule({
              providers: [
                WebMonController,
                {
                  provide: WebMonService,
                  useValue: createMock<WebMonService>()
                } as ValueProvider<WebMonService>
              ]
            })
            .compile();

    mockService = mocked(module.get(WebMonService));
    controller = module.get(WebMonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('startup check should call monitoring service', () => {
    mockService.check.mockImplementation(() => void 0);

    controller.triggerStartupCheck();

    expect(mockService.check).toHaveBeenCalledTimes(1);
  });

  it('periodic check should call monitoring service', () => {
    mockService.check.mockImplementation(() => void 0);

    controller.triggerPeriodicCheck();

    expect(mockService.check).toHaveBeenCalledTimes(1);
  });
});
