import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpInterceptor } from './interceptor';
import { HttpClient } from './client';
import { AxiosFactory } from './axios';
import { AxiosInstance } from 'axios';
export declare class AxiosBuilder implements AxiosFactory {
    build(): AxiosInstance;
}
export declare class HttpAxiosModule implements HttpModule {
    private handler;
    httpInterceptor: HttpInterceptingHandler;
    constructor(handler?: HttpInterceptor[]);
    getHttpClient(): HttpClient;
}
