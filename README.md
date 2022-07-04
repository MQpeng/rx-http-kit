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
import { HttpClient } from 'rx-http-kit';
export class UniBackend extends HttpBackend {
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
        return new Observable((observer: Observer<HttpEvent<any>>) => {
            uni.request({
                url: req.urlWithParams,
                data: req.body,
                method: req.method as any,
                withCredentials: req.withCredentials,
                header: req,
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
