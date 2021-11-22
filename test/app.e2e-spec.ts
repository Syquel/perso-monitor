import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import supertest from 'supertest';
import { HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';

describe('Smoke Test (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ops/health (GET)', async () => {
    const expectedHealthIndicatorResult: HealthIndicatorResult = {
      memory_heap: {
        status: 'up'
      },
      memory_rss: {
        status: 'up'
      }
    };

    await supertest(app.getHttpServer())
        .get('/ops/health')
        .expect(200)
        .expect({
          status: 'ok',
          details: expectedHealthIndicatorResult,
          info: expectedHealthIndicatorResult,
          error: {}
        } as HealthCheckResult);
  });
});
