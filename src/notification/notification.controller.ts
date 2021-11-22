import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationController {

    private readonly logger: Logger = new Logger(NotificationController.name);

    constructor(private readonly notificationService: NotificationService) {}

    @Timeout(0)
    public triggerStartupNotification(): void {
        this.notificationService
            .notify('PersoMon Startup Check', 'PersoMon has started!')
            .subscribe({
                error: err => this.logger.error('Startup Notification check failed', err)
            });
    }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    public triggerPeriodicNotification(): void {
        this.notificationService
            .notify('PersoMon still checking', 'PersoMon is still checking the status!')
            .subscribe({
                error: err => this.logger.error('Periodic Notification check failed', err)
            });
    }

}
