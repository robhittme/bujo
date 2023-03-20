import * as Koa from 'koa';
import { Context, DefaultState } from 'koa';
import * as Router from '@koa/router';
import * as cors from '@koa/cors';
//import { authorizationMiddleware, authenticationMiddleware } from './auth.service';
import type { Db, Entry, Collection } from './lib';

const entryTypeConverter = (text: string): Array<string> => {
  const [sym, ...rest] = text.split('');
  switch(sym) {
    case '.':
      return ['task', rest.join('').trim()]
    case 'o':
      return ['event', rest.join('').trim()]
    case '-':
      return ['note', rest.join('').trim()]
  }
  return ['task', text];
};
export const init = (db: Db): Koa => {
  const app = new Koa();

  const router = new Router<DefaultState, Context>();

  router.get('/entries', async (ctx: Koa.Context) => {
    const query = ctx.query;
    const start = Number(query.start) || 0;
    const end = Number(query.end) || Math.floor(Date.now() / 1000);
    const entries = await db.getEntries(start, end);

    ctx.response.body = entries;
    ctx.response.status = 200;
  });

  router.get('/entry/:id', async (ctx: Koa.Context) => {
    const entryId = ctx.params.id;
    const entry = await db.getEntry(entryId);
    ctx.response.body = entry;
    ctx.response.status = 200;
  });

  router.delete('/entry/:id', async (ctx: Koa.Context) => {
    try {
      const entryId = ctx.params.id;
      await db.deleteEntry(entryId);
      ctx.response.status = 204;
    } catch(error) {
      ctx.response.status = 500;
      console.log(error);
    }
  });

  router.put('/entry/:id', async (ctx: Koa.Context) => {
    try {
      const body = ctx.request.body as any;
      const entryId = ctx.params.id;
      const bodyText = body.text || null;
      const bodyEntryCompleted = body.completed || false;;
      const bodyEntryType = body.entryType || null;
      const bodyPriority = body.priority || null;
      const newEntry = await db.updateEntry(entryId, bodyText, bodyEntryCompleted, bodyEntryType, bodyPriority)
      ctx.response.body = newEntry;
      ctx.response.status = 200;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }

  })
  router.post('/entry', async (ctx: Koa.Context) => {
    try {
      const entry = ctx.request.body as Entry;
      const [entryType, text] = entryTypeConverter(entry.text);
      const newEntry = await db.addEntry({entryType, text})
      ctx.response.body = newEntry;
      ctx.response.status = 200;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }

  })

  router.post('/collection/:collectionId/entry/:entryId', async (ctx: Koa.Context) => {
    try {
      const collectionId = ctx.params.collectionId; 
      const entryId = ctx.params.entryId;
      const newEntryInCollection = await db.addEntryToCollection(entryId, collectionId)
      ctx.response.body = newEntryInCollection 
      ctx.response.status = 200;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }

  })

  router.post('/collection', async (ctx: Koa.Context) => {
    try {
      const entry = ctx.request.body as Collection;
      const [entryType, text] = entryTypeConverter(entry.name);
      const newEntry = await db.addCollection({name})
      ctx.response.body = newEntry;
      ctx.response.status = 200;
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = error;
      console.log(error)
    }

  })
  app.use(cors())
    //.use(authorizationMiddleware(db))
    //.use(authenticationMiddleware)
    .use(require('koa-bodyparser')())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
}

