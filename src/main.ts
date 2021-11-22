import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import Module = __WebpackModuleApi.Module;

declare const module: Module;

async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => void app.close());
  }

  return app;
}

void bootstrap();
