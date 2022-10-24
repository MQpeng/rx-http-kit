import * as Koa from 'koa';
import * as Router from '@koa/router';
import { NormalizeResponse } from './common';

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = NormalizeResponse.success({ message: 'hello world' });
});

router.all('/:status', async (ctx) => {
  const status = parseInt(ctx.params.status);
  console.log(
    '🚀 ~ file: server.ts ~ line 14 ~ router.all ~ query',
    ctx.querystring
  );

  if ((status >= 200 && status < 300) || status === 401) {
    ctx.body = NormalizeResponse.success(status);
    return;
  }
  ctx.throw(status, '', NormalizeResponse.success(status));

});

app.use(router.routes());
app.use(router.allowedMethods());

app
  .listen(9999)
  .once('listening', (stream) => {
    console.log('🚀 ~ test:server is listening', 9999);
  });
