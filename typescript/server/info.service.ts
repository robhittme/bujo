import * as Koa from 'koa';
import { Context, DefaultState } from 'koa';
import * as Router from '@koa/router';
import * as cors from '@koa/cors';

export const init = (): Koa => {
    const app = new Koa();

    const router = new Router<DefaultState, Context>();

    router.get('/health', (ctx: Koa.Context) => ctx.response.status = 204);

    app.use(cors())
       .use(router.routes())
       .use(router.allowedMethods());

    return app;
}

