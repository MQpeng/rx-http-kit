import {
  HttpXHR2Module,
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders,
  HttpResponseBase,
  HttpErrorResponse,
  HttpResponse
} from 'rx-http-kit';
import { catchError, mergeMap, Observable, of, throwError } from 'rxjs';

const environment = {
  api: {
    baseUrl: 'http://127.0.0.1:9999'
  },
  currentLang: 'zh-CN',
  ignores: [/\/login/, /\/register/]
};

function IsNotNil(obj: any) {
  return obj !== undefined && obj !== null;
}

export interface CommonResponse {
  success: boolean;
  data?: any;
  msg?: string;
}

export class MyInterceptor implements HttpInterceptor {
  private getAdditionalHeaders(headers?: HttpHeaders): {
    [name: string]: string;
  } {
    const res: { [name: string]: string } = {};
    const lang = environment.currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }

    return res;
  }

  /**
   * the normalization of `Http Status`
   * @param ev
   * @param req
   * @param next
   * @returns
   */
  private handleData(
    ev: HttpResponseBase,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    // Ignore Router
    if (environment.ignores?.some((vv) => vv.test(req.url))) return of(ev);
    // Business Normalization
    switch (ev.status) {
      case 200:
        if (ev instanceof HttpResponse) {
          const body = ev.body;
          // if (body instanceof Blob) {
          //   return of(ev);
          // }
          if (body && body.code) {
            if (200 !== body.code) {
              if (body.msg) {
                // Global Notification
                console.log(body.msg);
              }
            } else if (!req.params.has('_quiet')) {
              if (body.msg) {
                // Global Notification
                console.log(body.msg);
              }
            }
            return of(
              new HttpResponse({
                body: body,
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
          console.warn('can not define the error, may be CORS', ev);
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(() => ev);
    } else {
      return of(ev);
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Replenish prefix
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
    // console.log("🚀 ~ file: interceptor.ts ~ line 131 ~ MyInterceptor ~ newReq", newReq)
    return next.handle(newReq).pipe(
      mergeMap((ev) => {
        // Normalization
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // Next
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => {

        console.log("🚀 ~ file: interceptor.ts ~ line 146 ~ MyInterceptor ~ catchError ~ err", err)
        return throwError(()=>err.error);
      })
    );
  }
}
