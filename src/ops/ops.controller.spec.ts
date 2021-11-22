import { Test, TestingModule } from '@nestjs/testing';
import { OpsController } from './ops.controller';
import { TerminusModule } from '@nestjs/terminus';

describe('OpsController', () => {
  let controller: OpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
          TerminusModule
      ],
      controllers: [
          OpsController
      ]
    }).compile();

    controller = module.get<OpsController>(OpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
