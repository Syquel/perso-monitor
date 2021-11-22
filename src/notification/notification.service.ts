import { Observable } from 'rxjs';

export type NotificationProviderName = 'dummy' | 'gmail';

export interface NotificationSettings<PROVIDER_NAME extends NotificationProviderName, OPTIONS = undefined> {
    notification: {
        provider: PROVIDER_NAME;
        options: OPTIONS;
    };
}

export abstract class NotificationService {

    public abstract notify(description: string, message: string): Observable<void>;

}
