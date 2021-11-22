import { Injectable, Logger } from '@nestjs/common';
import { map, Observable, of, switchMap } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as JSDOM from 'jsdom';
import { PersoStatusRequest } from './perso-status-request';
import { URLSearchParams } from 'url';
import { AxiosRequestHeaders } from 'axios';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';

export interface WebMonSettings {
    monitoring: {
        idCardNumber: string;
    };
}

@Injectable()
export class WebMonService {

    private readonly unreadyText = 'liegt noch nicht zur Abholung bereit.';
    private readonly logger: Logger = new Logger(WebMonService.name);
    private readonly url: string = 'https://www17.muenchen.de/Passverfolgung/';

    constructor(
        private readonly configService: ConfigService<WebMonSettings>,
        private readonly httpService: HttpService,
        private readonly notificationService: NotificationService
    ) {}

    public check(): void {
        this.httpService.get<string>(this.url).pipe(
            map(htmlResponse => new JSDOM.JSDOM(htmlResponse.data).window.document),
            map(htmlDocument => this.buildRequest(htmlDocument)),
            switchMap(requestData => this.submitForm(requestData)),
            map(htmlDocument => this.extractReadiness(htmlDocument)),
            switchMap(ready => ready
                ? this.notificationService.notify('Personalausweiss fertig!', 'Der Personalausweiss ist fertig!')
                : of(void 0)
            )
        ).subscribe({
            next: () => {
                this.logger.debug('Finished checking successfully');
            },
            error: err => {
                this.logger.error('Failed to acquire status', err);
            }
        });
    }

    private buildRequest(document: Document): PersoStatusRequest {
        const form: HTMLFormElement | null = document.forms.namedItem('f1');
        if (!form) {
            throw Error('Cannot find form');
        }

        const nonceInput: HTMLInputElement | null = form.elements.namedItem('__ncforminfo') as HTMLInputElement | null;
        if (!nonceInput) {
            throw new Error('Cannot find nonce input');
        }

        this.logger.debug('Acquired form nonce: ' + nonceInput.value);

        const idCardNumber: string | undefined = this.configService.get('monitoring.idCardNumber', { infer: true });
        if (idCardNumber === undefined) {
            throw new Error('Missing ID card number');
        }

        this.logger.debug('Checking ID card number ' + idCardNumber);

        return { pbAbfragen: 'Abfragen', ifNummer: idCardNumber, __ncforminfo: nonceInput.value };
    }

    private submitForm(requestData: PersoStatusRequest): Observable<Document> {
        const formData: URLSearchParams = new URLSearchParams({
            pbAbfragen: requestData.pbAbfragen,
            ifNummer: requestData.ifNummer,
            __ncforminfo: requestData.__ncforminfo
        } as Record<keyof PersoStatusRequest, string>);

        const requestHeaders: AxiosRequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

        this.logger.debug('Built request to URL ' + this.url + ' with data "' + formData.toString() + '"');

        return this.httpService
            .post<string>(this.url, formData, { headers: requestHeaders })
            .pipe(
                map(htmlResponse => new JSDOM.JSDOM(htmlResponse.data).window.document)
            );
    }

    private extractReadiness(document: Document): boolean {
        const potentialStatusElements: HTMLCollectionOf<Element> = document.getElementsByClassName('iFont2');
        if (potentialStatusElements.length != 1) {
            throw Error(`Expected only one potential status element, but got ${potentialStatusElements.length}`);
        }

        const statusText: string | null = potentialStatusElements.item(0)?.textContent ?? null;
        this.logger.debug(`Status Element: ${statusText ?? 'N/A'}`);

        return this.unreadyText !== statusText;
    }
}
