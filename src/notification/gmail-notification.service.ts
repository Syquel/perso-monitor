import { Injectable } from '@nestjs/common';
import { JWT, JWTOptions } from 'google-auth-library';
import { from, map, Observable, switchMap } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import StreamTransport from 'nodemailer/lib/stream-transport';
import { NotificationService, NotificationSettings } from './notification.service';
import { gmail, gmail_v1 } from '@googleapis/gmail';
import Gmail = gmail_v1.Gmail;
import Params$Resource$Users$Messages$Send = gmail_v1.Params$Resource$Users$Messages$Send;

export interface GmailNotificationOptions {
    serviceAccountKeyFile: string;
    fromMail: string;
    toMail: string;
}

export type GmailNotificationSettings = NotificationSettings<'gmail', GmailNotificationOptions>;

@Injectable()
export class GmailNotificationService extends NotificationService {

    private readonly auth: JWT;

    constructor(private readonly configService: ConfigService<GmailNotificationSettings>) {
        super();

        this.auth = new JWT({
            keyFile: configService.get('notification.options.serviceAccountKeyFile', { infer: true }),
            scopes: [ 'https://www.googleapis.com/auth/gmail.send' ],
            subject: configService.get('notification.options.fromMail', { infer: true })
        } as JWTOptions);
    }

    public notify(description: string, message: string): Observable<void> {
        const gmailClient: Gmail = gmail({ version: 'v1', auth: this.auth });

        const mailTransport = nodemailer.createTransport({ streamTransport: true, buffer: true } as StreamTransport.Options);
        return from(this.auth.authorize()).pipe(
            switchMap(() =>
                mailTransport.sendMail({
                    to: this.configService.get('notification.options.toMail', { infer: true }),
                    subject: description,
                    text: message
                })
            ),
            map(messageInfo => {
                return { userId: 'me', requestBody: { raw: (messageInfo.message as Buffer).toString('base64url') } } as Params$Resource$Users$Messages$Send;
            }),
            switchMap(mail => gmailClient.users.messages.send(mail)),
            map(() => void 0)
        );
    }

}
