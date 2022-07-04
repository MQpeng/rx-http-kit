import { HttpHeaders } from './headers';
import { Observable } from 'rxjs';
import { HttpBackend } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import { AxiosInstance, AxiosRequestHeaders } from 'axios';
export declare function HttpHeader2Axios(headers: HttpHeaders): AxiosRequestHeaders;
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
export declare abstract class AxiosFactory {
    abstract build(): AxiosInstance;
}
export declare class HttpAxiosBackend implements HttpBackend {
    private axiosFactory;
    constructor(axiosFactory: AxiosFactory);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}
