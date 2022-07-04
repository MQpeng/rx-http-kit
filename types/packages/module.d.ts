import { HttpInterceptor } from './interceptor';
import { Observable } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import { HttpClient } from './client';
export declare class HttpInterceptingHandler implements HttpHandler {
    private backend;
    private interceptors;
    private chain;
    constructor(backend: HttpBackend, interceptors?: HttpInterceptor[]);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
export interface HttpModule {
    httpInterceptor: HttpInterceptingHandler;
    getHttpClient: () => HttpClient;
}
