import { Module } from '@nestjs/common';
import { OpsController } from './ops.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
      TerminusModule
  ],
  controllers: [
      OpsController
  ]
})
export class OpsModule {}
