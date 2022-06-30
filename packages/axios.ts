import { HttpHeaders } from './headers';
import { Observable, Observer } from 'rxjs';
import { HttpBackend } from './backend';
import { HttpRequest } from './request';
import {
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpResponse,
  HttpStatusCode,
  HttpUploadProgressEvent
} from './response';
import { AxiosError, AxiosInstance, AxiosRequestHeaders } from 'axios';

export function HttpHeader2Axios(headers: HttpHeaders): AxiosRequestHeaders {
  const result: Record<string, string | number | boolean> = {};
  headers.forEach((key, value) => {
    result[key] = value.join(',');
  });
  return result;
}

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
export abstract class AxiosFactory {
  abstract build(): AxiosInstance;
}

export class HttpAxiosBackend implements HttpBackend {
  constructor(private axiosFactory: AxiosFactory) {}
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    // Everything happens on Observable subscription.
    return new Observable((observer: Observer<HttpEvent<any>>) => {
      const Axios = this.axiosFactory.build();
      const headers = HttpHeader2Axios(req.headers);
      // Add an Accept header if one isn't present already.
      if (!req.headers.has('Accept')) {
        headers['Accept'] = 'application/json, text/plain, */*';
      }

      // Auto-detect the Content-Type header if one isn't present already.
      if (!req.headers.has('Content-Type')) {
        const detectedType = req.detectContentTypeHeader();
        // Sometimes Content-Type detection fails.
        if (detectedType !== null) {
          headers['Content-Type'] = detectedType;
        }
      }
      Axios({
        method: req.method,
        url: req.url,
        data: req.body,
        headers: headers,
        responseType: req.responseType,
        params: req.params,
        withCredentials: req.withCredentials,
        onDownloadProgress: (event: ProgressEvent) => {
          if (!req.reportProgress) return;
          // Start building the download progress event to deliver on the response
          // event stream.
          let progressEvent: HttpDownloadProgressEvent = {
            type: HttpEventType.DownloadProgress,
            loaded: event.loaded
          };

          // Set the total number of bytes in the event if it's available.
          if (event.lengthComputable) {
            progressEvent.total = event.total;
          }

          // If the request was for text content and a partial response is
          // available on XMLHttpRequest, include it in the progress event
          // to allow for streaming reads.
          // if (req.responseType === 'text' && !!xhr.responseText) {
          //   progressEvent.partialText = xhr.responseText;
          // }

          // Finally, fire the event.
          observer.next(progressEvent);
        },
        onUploadProgress: (event: ProgressEvent) => {
          // Upload progress events are simpler. Begin building the progress
          // event.
          let progress: HttpUploadProgressEvent = {
            type: HttpEventType.UploadProgress,
            loaded: event.loaded
          };

          // If the total number of bytes being uploaded is available, include
          // it.
          if (event.lengthComputable) {
            progress.total = event.total;
          }

          // Send the event.
          observer.next(progress);
        }
      })
        .then((res) => {
          let { headers, status, statusText, config } = res;
          const _header = new HttpHeaders(headers);
          observer.next(
            new HttpHeaderResponse({
              headers: _header,
              status: status,
              statusText,
              url: config.url
            })
          );
          // The body will be read out if present.
          let body: any | null = null;
          if (status !== HttpStatusCode.NoContent) {
            // Use XMLHttpRequest.response if set, responseText otherwise.
            body = res.data;
          }
          if (status === 0) {
            status = !!body ? HttpStatusCode.Ok : 0;
          }
          // ok determines whether the response will be transmitted on the event or
          // error channel. Unsuccessful status codes (not 2xx) will always be errors,
          // but a successful status code can still result in an error if the user
          // asked for JSON data and the body cannot be parsed as such.
          let ok = status >= 200 && status < 300;
          if (ok) {
            // A successful response is delivered on the event stream.
            observer.next(
              new HttpResponse({
                body,
                headers: _header,
                status,
                statusText,
                url: config.url || undefined
              })
            );
            // The full body has been received and delivered, no further events
            // are possible. This request is complete.
            observer.complete();
          } else {
            // An unsuccessful request is delivered on the error channel.
            observer.error(
              new HttpErrorResponse({
                // The error in this case is the response body (error from the server).
                error: body,
                headers: _header,
                status,
                statusText,
                url: config.url || undefined
              })
            );
          }
        })
        .catch((err: AxiosError) => {
          const response = err.response;

          const res = new HttpErrorResponse({
            error: err.message,
            status: response?.status || 0,
            statusText: response?.statusText || 'Unknown Error',
            url: err?.config.url || undefined
          });
          observer.error(res);
        });
    });
  }
}
