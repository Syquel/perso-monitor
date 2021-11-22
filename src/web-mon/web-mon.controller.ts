import { Injectable, Logger } from '@nestjs/common';
import { WebMonService } from './web-mon.service';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

@Injectable()
export class WebMonController {

    private readonly logger: Logger = new Logger(WebMonController.name);

    constructor(private readonly webMonService: WebMonService) {}

    @Timeout(0)
    public triggerStartupCheck(): void {
        this.logger.debug('Startup Check...');

        this.webMonService.check();
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    public triggerPeriodicCheck(): void {
        this.logger.debug('Periodic Check...');

        this.webMonService.check();
    }

}
