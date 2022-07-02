import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpInterceptor } from './interceptor';
import { HttpClient } from './client';
import { AxiosFactory, HttpAxiosBackend } from './axios';
import Axios, { AxiosInstance } from 'axios';

export class AxiosBuilder implements AxiosFactory {
  build(): AxiosInstance {
    return Axios;
  }
}

export class HttpAxiosModule implements HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  constructor(private handler: HttpInterceptor[] = []) {
    this.httpInterceptor = new HttpInterceptingHandler(
      new HttpAxiosBackend(new AxiosBuilder()),
      this.handler
    );
  }

  getHttpClient() {
    return new HttpClient(this.httpInterceptor);
  }
}
