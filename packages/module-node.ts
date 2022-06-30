import { HttpXhrBackend, XhrFactory } from './xhr';
import * as xhr2 from 'xhr2';
import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpInterceptor } from './interceptor';
import { HttpClient } from './client';

export class ServerXhr implements XhrFactory {
  build(): XMLHttpRequest {
    return new xhr2.XMLHttpRequest();
  }
}

export class HttpXHR2Module implements HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  constructor(private handler: HttpInterceptor[] = []) {
    this.httpInterceptor = new HttpInterceptingHandler(
      new HttpXhrBackend(new ServerXhr()),
      this.handler
    );
  }

  getHttpClient() {
    return new HttpClient(this.httpInterceptor);
  }
}
