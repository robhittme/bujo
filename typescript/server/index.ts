import * as Koa from 'koa';
import * as mount from 'koa-mount';
import { responseTimeMiddleware } from './responseTimeMiddleware';
import { init as info } from './info.service';
import { init as entries } from './entries.service';
//import { init as auth, authorizationMiddleware } from './auth.service';
import { initPool } from './dbPool';
import type { Config } from '../config';
import * as dotenv from 'dotenv';
dotenv.config();

export const init = (config: Config) => {
    const db = initPool(config.db)
    const app = new Koa();
    //app.use(authorizationMiddleware(db))
    app.use(responseTimeMiddleware);
    app.use(mount('/info', info()));
    app.use(mount('/bujo', entries(db)));
 //   app.use(mount('/auth', auth(db)));
    app.listen(config.http.port
                  ,undefined
                  ,undefined
                  ,() => console.log(`Listening on port ${config.http.port}`)
                  );
};


