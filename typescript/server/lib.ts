import { strict as assert } from 'assert';
import { readdirSync, readFileSync } from 'fs';
import { join as joinPaths } from 'path';
import { Pool, QueryResult } from 'pg';


export type Entry = {
  id: number,
  text: string,
  created_timestamp: string,
  entryType: string,
  completed: boolean
}

export type User = {
  id: number,
  username: string,
  passwordHash: string,
  verified: boolean
}


const extractRows = <T extends QueryResult>(result: QueryResult<T>): Array<T> => result.rows;
const headOrError = <T>(rows: Array<T>): T => {
    const numRows = rows.length;
    if (numRows === 1) { return rows[0]; }
    throw new Error(`${numRows} results instead of exactly 1`);
};
const atMostOneRowImpactedByStatementOrError = <T extends QueryResult>(result: QueryResult<T>): QueryResult<T> => {
  if(result.rowCount > 1) { throw new Error(`${result.rowCount} rows impacted instead of at most 1`); }
  return result;
}

const atLeastOneRowImpactedByStatementOrError = <T extends QueryResult>(result: QueryResult<T>): QueryResult<T> => {
    if (result.rowCount < 1) { throw new Error(`${result.rowCount} rows impacted instead of at least 1`); }
    return result;
};

export type Db = {
  getEntries: () => Promise<any>,
  getEntry: (id: string) => Promise<any>,
  getUser: (uid: string, passwordHash: string) => Promise<User>,
  getSessionToken: (token: string) => Promise<any>,
  addEntry: (entry: any) => Promise<Entry>,
  createUser: (user: any) => Promise<any>,
  updateEntry: (entryId: number, text: string|null, entryCompleted: string|null, entryType: string|null, deadline: number | null, priority: boolean | null) => Promise<Entry>,
  deleteEntry: (entryId: number) => Promise<void>
  validateUser: (username: string, passwordHash: string) => Promise<any>
};

export const Db = (pool: Pool): Db => {
  const queriesDir = joinPaths(__dirname, '..', 'queries');
  const queries = readdirSync(queriesDir).reduce((q: {[key: string]: string}, p) => {
    const absolutePath = joinPaths(queriesDir, p);
    const content = readFileSync(absolutePath, 'utf8')
      .replace(/--.+(\r\n|\r|\n)/g, '') // remove comments
      .replace(/\s+/g, ' ').trim(); // remove extra whitespace

    q[p.split('.')[0]] = content;
    return q;
  }, {});

  assert(queries.getEntries);
  assert(queries.getEntry);
  assert(queries.getSessionToken);
  assert(queries.addEntry);
  assert(queries.updateEntry);
  assert(queries.deleteEntry);
  assert(queries.createUser);
  assert(queries.validateUser);
  assert(queries.getUser);
  return {
    getEntries: async (): Promise<any> => {
      return pool.query(queries.getEntries)
        .then(extractRows)
        .then((raw: any) => {
          return raw

        });
    },
    getEntry: async (id: string): Promise<any> => {
      return pool.query(queries.getEntry, [id])
        .then(extractRows)
        .then((raw: any) => {
          return raw
        });
    },
    getUser: async (username: string, passwordHash: string): Promise<User> => {
      return pool.query(queries.getUser, [username, passwordHash])
        .then(extractRows)
        .then((raw: any) => {
          return raw
        });
    },
    getSessionToken: async (token: string): Promise<any> => {
      console.log({token})
      return pool.query(queries.getSessionToken, [token])
        .then(extractRows)
        .then(headOrError)
        .then((raw: any) => {
          return raw
        });
    },
    addEntry: async (entry: any): Promise<any> => {
      const { entryType, text } = entry;
      return pool.query(queries.addEntry, [text, entryType])
        .then(extractRows)
        .then(headOrError)
        .then(raw => {
          return raw;
        });
    },
    updateEntry: async (entryId: number, text: string|null, entryCompleted: string|null, entryType: string|null, deadline: number|null, priority:boolean|null): Promise<Entry> => {
      const params = [entryId, text, entryCompleted, entryType, deadline, priority];
      return pool.query(queries.updateEntry, params)
        .then(atLeastOneRowImpactedByStatementOrError)
        .then(extractRows)
        .then(headOrError)
        .then(raw => {
          return raw;
        })
        .catch(e => {
          console.log('error updating entry', e);
          return e;
        });
    },
    deleteEntry: async (id: number): Promise<any> => {
      return pool.query(queries.deleteEntry, [id])
        .then(atMostOneRowImpactedByStatementOrError)
        .then(raw => raw.rowCount === 1)
        .catch(e => false);
    },
    createUser: async (user: any): Promise<any> => {
      const { username, passwordHash } = user;
      return pool.query(queries.createUser, [username, passwordHash])
        .then(extractRows)
        .then(headOrError)
        .then(raw => {
          console.log({raw})
          return raw;
        });
    },
    validateUser: async (username: string, passwordHash: string): Promise<any> => {
      return pool.query(queries.validateUser, [username, passwordHash])
        .then(extractRows)
        .then(headOrError)
        .then(raw => {
          return raw.session_token;
        });
    },
  }
}
