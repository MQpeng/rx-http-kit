import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { Observable } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';
import { HttpClient } from './client';

export class HttpInterceptingHandler implements HttpHandler {
  private chain: HttpHandler | null = null;

  constructor(
    private backend: HttpBackend,
    private interceptors: HttpInterceptor[] = []
  ) {}

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (this.chain === null) {
      this.chain = this.interceptors.reduceRight(
        (next, interceptor) => new HttpInterceptorHandler(next, interceptor),
        this.backend
      );
    }
    return this.chain.handle(req);
  }
}

export interface HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  getHttpClient: () => HttpClient;
}
