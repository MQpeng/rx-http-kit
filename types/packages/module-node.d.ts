import { XhrFactory } from './xhr';
import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpInterceptor } from './interceptor';
import { HttpClient } from './client';
export declare class ServerXhr implements XhrFactory {
    build(): XMLHttpRequest;
}
export declare class HttpXHR2Module implements HttpModule {
    private handler;
    httpInterceptor: HttpInterceptingHandler;
    constructor(handler?: HttpInterceptor[]);
    getHttpClient(): HttpClient;
}
