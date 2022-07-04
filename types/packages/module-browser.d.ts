import { HttpClient } from './client';
import { HttpInterceptor } from './interceptor';
import { HttpInterceptingHandler, HttpModule } from './module';
import { XhrFactory } from './xhr';
export declare class BrowserXhr implements XhrFactory {
    build(): XMLHttpRequest;
}
export declare class HttpXHRModule implements HttpModule {
    private handler;
    httpInterceptor: HttpInterceptingHandler;
    constructor(handler?: HttpInterceptor[]);
    getHttpClient(): HttpClient;
}
