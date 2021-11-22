import { NotificationService } from './notification.service';
import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class DummyNotificationService extends NotificationService {

    notify(description: string, message: string): Observable<void> {
        void description;
        void message;

        return of(void 0);
    }

}
