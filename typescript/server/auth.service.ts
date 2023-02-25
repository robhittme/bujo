import * as Koa from 'koa';
import { Context, DefaultState } from 'koa';
import * as Router from '@koa/router';
import * as cors from '@koa/cors';
import * as crypto from 'crypto';
import type { Db, Entry, User } from './lib';
import * as jwt from 'jsonwebtoken'
import { Secret, JwtPayload } from 'jsonwebtoken';

type UserInput = {
  username: string,
  password:  string
}
type ValidateToken = {
  token: string
}

type JwtResponse = {
  user: PartialUser,
  token: string | JwtPayload
}
type PartialUser = Partial<User>;

const getJwt = (user: PartialUser): JwtResponse => {
  const SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
  const {id, username} = user;
  const token = jwt.sign({ id, username }, SECRET, { expiresIn: '2 days' })
  return { user, token }
}

export const init = (db: Db): Koa => {
  const app = new Koa();

  const router = new Router<DefaultState, Context>();

  router.delete('/user/:id', async (ctx: Koa.Context) => {
    try {
      const entryId = ctx.params.id;
      const deleted= await db.deleteEntry(entryId);
      ctx.response.status = 204;
    } catch(error) {
      ctx.response.status = 500;
      console.log(error);
    }
  });

  router.post('/user', async (ctx: Koa.Context) => {
    try {
      //TODO: make sure that there is a confirmation password.
      const entry = ctx.request.body as User;
      const passwordHash = crypto.createHash('sha256').update(entry.passwordHash).digest('base64')

      const user = await db.createUser({...entry, passwordHash })
      ctx.response.status = 200;
      ctx.response.body = {id: user.id};
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }
  })

  router.get('/validate-token', async (ctx: Koa.Context) => {
    try {
      ctx.response.status = 200;
      ctx.response.body = { valid: true }
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }
  })
  router.post('/sign-in', async (ctx: Koa.Context) => {
    try {
      console.log(ctx.request.body)
      const userInput = ctx.request.body as UserInput;
      const passwordHash = crypto.createHash('sha256').update(userInput.password).digest('base64')

      console.log({ userInput })
      const { id, username } = await db.getUser(userInput.username, passwordHash)
      const { token } = getJwt({ id, username })
      ctx.response.status = 200;
      ctx.response.body = { accessToken: token }
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }
  })

  app.use(cors())
    .use(require('koa-bodyparser')())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}

export const authenticationMiddleware = async (ctx: Context, next: () => Promise<any>) => {
  if(!ctx.state.user){
    ctx.response.status = 403;
    ctx.response.body = {'message': 'unable to authorize request'}
    return
  }
  console.log(ctx.state.user)
  await next();
}
export const authorizationMiddleware = (db: Db) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    if(ctx.request.url === '/auth/sign-in') {
      await next()
      return
    }

    const matches = ctx.get('authorization').match(/^Bearer (.*)$/)
    if(matches) {
      const token: string = matches[1];
      const SECRET = process.env.ACCESS_TOKEN_SECRET as Secret;
      try {
        const decoded = jwt.verify(token, SECRET) as JwtPayload;
        ctx.state.user = decoded;
        await next()
        return
      } catch(e) {
        ctx.response.status = 401;
        ctx.response.body = { 'message': 'unable to authenticate request' };
        return
      }
    } else {
      ctx.response.status = 401;
      ctx.response.body = { 'message': 'unable to authenticate request' };
      return
      }
    await next()
  }
}


