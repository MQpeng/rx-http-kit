import { HttpInterceptingHandler, HttpModule } from './module';
import { HttpInterceptor } from './interceptor';
import { HttpClient } from './client';
import { AxiosFactory, HttpAxiosBackend } from './axios';
import Axios, { AxiosInstance } from 'axios';

export class ServerAxios implements AxiosFactory {
  build(): AxiosInstance {
    return Axios;
  }
}

export class HttpAxiosModule implements HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  constructor(private handler: HttpInterceptor[] = []) {
    this.httpInterceptor = new HttpInterceptingHandler(
      new HttpAxiosBackend(new ServerAxios()),
      this.handler
    );
  }

  getHttpClient() {
    return new HttpClient(this.httpInterceptor);
  }
}
