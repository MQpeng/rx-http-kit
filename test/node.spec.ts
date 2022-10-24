import * as assert from 'assert';
import { HttpXHR2Module, HttpAxiosModule } from 'rx-http-kit';
import { CommonResponse, MyInterceptor } from './interceptor';
import { NormalizeResponse } from './common';
import { catchError, forkJoin, merge, of } from 'rxjs';
console.log('HttpXHR2Module', typeof HttpXHR2Module);

let rxHttpModule = new HttpXHR2Module([new MyInterceptor()]);
let httpClient = rxHttpModule.getHttpClient();

describe('HttpXHR2Module', function () {
  describe('getHttpClient()', function () {
    it('should return "hello world" when the route is "/"', function (done) {
      httpClient.get<CommonResponse>('/').subscribe({
        next(value) {
          assert.equal(value.data.message, 'hello world');
          done();
        },
        error(err) {
          done(err);
        }
      });
    });
    it('should return "{success: true, data: 200}" when the route is "/200"', function (done) {
      forkJoin([
        httpClient.get<CommonResponse>('/200', {
          params: { id: '123456' }
        }),
        httpClient.post<CommonResponse>(
          '/200',
          { id: '123456' },
          {
            params: { name: 'jack' },
            headers: {
              abc: 'sdfasdf'
            }
          }
        ),
        httpClient.delete<CommonResponse>('/200', {
          params: { id: '123456' }
        }),
        httpClient.delete<CommonResponse>('/400', {
          params: { id: '400' }
        }),
        httpClient.put<CommonResponse>(
          '/200',
          { id: '123456' },
          {
            params: { name: 'jack' }
          }
        )
      ]).subscribe({
        next(result) {
          console.log("🚀 ~ file: node.spec.ts ~ line 57 ~ next ~ result", result)
          assert.equal(result[0].data, 200);
          assert.equal(result[1].data, 200);
          assert.equal(result[2].data, 200);
          assert.equal(result[3].data, 400);
          assert.equal(result[4].data, 200);
          done();
        },
        error(err) {
          console.log("🚀 ~ file: node.spec.ts ~ line 65 ~ error ~ err", err)
          assert.equal(err.data, 400);
          done();
        }
      });
    });
  });
});

const rxHttpAxiosModule = new HttpAxiosModule([new MyInterceptor()]);
const httpClientAxios = rxHttpAxiosModule.getHttpClient();

describe('HttpAxiosModule', function () {
  describe('getHttpClient()', function () {
    it('should return "hello world" when the route is "/"', function (done) {
      httpClientAxios.get<CommonResponse>('/').subscribe({
        next(value) {
          assert.equal(value.data.message, 'hello world');
          done();
        },
        error(err) {
          done(err);
        }
      });
    });
    it('should return "{success: true, data: 200}" when the route is "/200"', function (done) {
      forkJoin([
        httpClientAxios.get<CommonResponse>('/200', {
          params: { id: '123456' }
        }),
        httpClientAxios.post<CommonResponse>(
          '/200',
          { id: '123456' },
          {
            params: { name: 'jack' }
          }
        ),
        httpClientAxios.delete<CommonResponse>('/200', {
          params: { id: '123456' }
        }),
        httpClientAxios.put<CommonResponse>(
          '/200',
          { id: '123456' },
          {
            params: { name: 'jack' }
          }
        )
      ]).subscribe({
        next(result) {
          assert.equal(result[0].data, 200);
          assert.equal(result[1].data, 200);
          assert.equal(result[2].data, 200);
          assert.equal(result[3].data, 200);
          done();
        },
        error(err) {
          done(err);
        }
      });
    });
  });
});
