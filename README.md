# Rx-Http-Kit

Rx-Http-kit based in RxJS, provides axios、xhr2、xhr backend. If you have used Angular's HttpClient, you will definitely be sighing the convenience of the style of RxJS. It supports NodeJs & Browser env.

Lets go!

# Quick Start

> some sample is in `test` dir, [Quick Test](https://github.com/MQpeng/rx-http-kit/tree/main/test)

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
