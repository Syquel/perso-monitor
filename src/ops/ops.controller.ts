import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult, MemoryHealthIndicator } from '@nestjs/terminus';

const MAX_HEAP_BYTES = 250 * 1024 * 1024;
const MAX_RSS_BYTES = 350 * 1024 * 1024;

@Controller('ops')
export class OpsController {

    constructor(private readonly healthCheckService: HealthCheckService, private readonly memoryHealthIndicator: MemoryHealthIndicator) {}

    @Get('health')
    @HealthCheck()
    public readHealth(): Promise<HealthCheckResult> {
        return this.healthCheckService.check([
            (): Promise<HealthIndicatorResult> => this.memoryHealthIndicator.checkHeap('memory_heap', MAX_HEAP_BYTES),
            (): Promise<HealthIndicatorResult> => this.memoryHealthIndicator.checkRSS('memory_rss', MAX_RSS_BYTES)
        ]);
    }

}
