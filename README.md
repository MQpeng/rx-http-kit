# Rx-Http-Kit

Rx-Http-kit based in RxJS, provides axios、xhr2、xhr backend. If you have used Angular's HttpClient, You will definitely feel the convenience of RxJS. It supports NodeJs & Browser env.

Lets go!

# Quick Start

> More usage samples can be found in the test directory. [(Quick Test Dir)](https://github.com/MQpeng/rx-http-kit/tree/main/test)

```
npm install -S rx-http-kit
pnpm add rx-http-kit
```

# Axios Backend

```javascript
import { HttpAxiosModule } from 'rx-http-kit';
const rxHttpAxiosModule = new HttpAxiosModule();
const httpClientAxios = rxHttpAxiosModule.getHttpClient();
httpClientAxios.get<CommonResponse>('/')
.pipe(tap((res)=>{
  // handle response data;
}),finalize(()=>{
  // eval func, such as remove loading status.
}))
.subscribe({
  next(response){

  },
  error(err) {
  }
})
```

# XHR Backend(Browser env)

```javascript
import { HttpXHRModule } from 'rx-http-kit';
const rxHttpXHRModule = new HttpXHRModule();
const httpClient = rxHttpXHRModule.getHttpClient();
httpClient.get<CommonResponse>('/')
.pipe(tap((res)=>{
  // handle response data;
}),finalize(()=>{
  // eval func, such as remove loading status.
}))
.subscribe({
  next(response){

  },
  error(err) {
  }
})
```

# Custom Backend (UniApp)
```typescript
import {
  HttpClient, HttpBackend, HttpRequest, HttpEvent, HttpHeaders,
  HttpHeaderResponse, HttpStatusCode,
  HttpResponse,HttpErrorResponse,HttpModule,HttpInterceptingHandler,HttpInterceptor,HttpHandler,HttpResponseBase
} from 'rx-http-kit';
import { catchError, mergeMap, Observable, Observer, of, throwError } from "rxjs";
import { Storage } from '@util/storage';
import {Config} from '@config'

export class UniBackend extends HttpBackend {
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        return new Observable((observer: Observer<HttpEvent<any>>) => {
            uni.request({
                url: req.urlWithParams,
                data: req.body,
                method: req.method as any,
                withCredentials: req.withCredentials,
                header: req.headers.toObject(),
                success: (result: UniApp.RequestSuccessCallbackResult) => {
                    let status = result.statusCode;
                    const _header = new HttpHeaders(result.header);
                    observer.next(
                        new HttpHeaderResponse({
                            headers: _header,
                            status: result.statusCode,
                            url: req.url,
                        })
                    );
                    let body: any | null = null;
                    if (status !== HttpStatusCode.NoContent) {
                        // Use XMLHttpRequest.response if set, responseText otherwise.
                        body = result.data;
                    }
                    if (status === 0) {
                        status = !!body ? HttpStatusCode.Ok : 0;
                    }
                    let ok = status >= 200 && status < 300;
                    if (ok) {
                        observer.next(
                            new HttpResponse({
                                body,
                                headers: _header,
                                status,
                                url: req.url,
                            })
                        );
                        observer.complete();
                    } else {
                        observer.error(
                            new HttpErrorResponse({
                                error: body,
                                headers: _header,
                                status,
                                url: req.url,
                            })
                        );
                    }
                },
                fail: (result: UniApp.GeneralCallbackResult) => {
                    const res = new HttpErrorResponse({
                        error: result.errMsg,
                        url: req.url,
                    });
                    observer.error(res);
                },
            });
        });
    }
}

export class MyInterceptor implements HttpInterceptor{

  getAdditionalHeaders(headers: HttpHeaders) {
    const AspMap = {
        'zh-Hans': 'zh-Hans',
        en: 'en',
    };
    const LangMap = {
        'zh-Hans': 'zh-CN',
        en: 'en-US',
    };

    const SysLangMap = {
        'zh-CN': 'zh-Hans',
        zh: 'zh-Hans',
        zh_CN: 'zh-Hans',
        'en-US': 'en',
        en: 'en',
    };
    const offset = new Date().getTimezoneOffset() / 60;
    let systemLanguage: any;
    // #ifdef H5
    systemLanguage = navigator.language;
    // #endif
    // #ifdef MP-WEIXIN
    systemLanguage = uni.getSystemInfoSync().language;
    // #endif
    let defaultLuang = Storage.getItemSync(Config.i18nLocal) || SysLangMap[systemLanguage] || SysLangMap.zh_CN;

    return {
      '.aspnetcore.culture': AspMap[defaultLuang],
      'accept-language': LangMap[defaultLuang],
      '.Timezone-Offset': offset >= 0 ? `+${offset}` : `${offset}`,
      Authorization: `Bearer ${Storage.getItemSync('token') || ''}`
    };
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log("🚀 ~ file: rx-http.ts ~ line 112 ~ MyInterceptor ~ req", req)
    let url = req.url;
    if (
      !/assets\//.test(url) &&
      !url.startsWith('https://') &&
      !url.startsWith('http://')
    ) {
      const baseUrl= Config.baseUrl!;
      url =
        baseUrl +
        (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    const newReq = req.clone({
      url,
      setHeaders: this.getAdditionalHeaders(req.headers)
    });
    console.log("🚀 ~ file: rx-http.ts ~ line 129 ~ MyInterceptor ~ newReq", newReq)
    return next.handle(newReq).pipe(
      mergeMap((ev) => {
        // Normalization
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // Next
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
    );
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    switch (ev.status) {
      case 200:
        if (ev instanceof HttpResponse) {
          const body = ev.body;
          if (body) {
            return of(
              new HttpResponse({
                body: (body?.result ? body?.result : body) || null,
                headers: ev.headers,
                status: ev.status,
                statusText: ev.statusText,
                url: ev.url as any
              })
            );
          }
        }
        break;
      case 401:
        break;
      case 403:
      case 404:
      case 500:
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            '未可知错误，大部分是由于后端不支持跨域CORS或无效配置引起'
            ev
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(()=> ev);
    } else {
      return of(ev);
    }
  }
}

export class HttpUniModule implements HttpModule {
  httpInterceptor: HttpInterceptingHandler;
  constructor(private handler: HttpInterceptor[] = []) {
    this.httpInterceptor = new HttpInterceptingHandler(
      new UniBackend(),
      this.handler
    );
  }

  getHttpClient() {
    return new HttpClient(this.httpInterceptor);
  }
}



export const RxHttpClient = new HttpUniModule([new MyInterceptor()]).getHttpClient();
```

# Interception

```typescript
import { HttpAxiosModule, HttpXHRModule, HttpInterceptor } from 'rx-http-kit';

export class MyInterceptor implements HttpInterceptor{
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let url = req.url;
    if (
      !/assets\//.test(url) &&
      !url.startsWith('https://') &&
      !url.startsWith('http://')
    ) {
      const { baseUrl } = environment.api;
      url =
        baseUrl +
        (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    const newReq = req.clone({
      url,
      setHeaders: this.getAdditionalHeaders(req.headers)
    });
    return next.handle(newReq).pipe(
      mergeMap((ev) => {
        // Normalization
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // Next
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
    );
  }
}

const rxHttpAxiosModule = new HttpAxiosModule([new MyInterceptor()]);
// const rxHttpXHRModule = new HttpXHRModule();
```
