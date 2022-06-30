import { HttpClient } from './client';
import { HttpInterceptor } from './interceptor';
import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpXhrBackend, XhrFactory } from './xhr';

export class BrowserXhr implements XhrFactory {
  build(): XMLHttpRequest {
    return new XMLHttpRequest();
  }
}

export class HttpXHRModule implements HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  constructor(private handler: HttpInterceptor[] = []) {
    this.httpInterceptor = new HttpInterceptingHandler(
      new HttpXhrBackend(new BrowserXhr()),
      this.handler
    );
  }

  getHttpClient() {
    return new HttpClient(this.httpInterceptor);
  }
}
