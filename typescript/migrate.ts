import { readdirSync, readFileSync } from 'fs';
import { join as joinPaths } from 'path';
import { createHash } from 'crypto';
import { Client as PgClient } from 'pg';
import type { DbConfig } from './config';

type Migration = {
    name: string,
    digest: string,
    contents: string,
    absolutePath: string,
};

const findMigrations = (): Migration[] => {
    const dir = joinPaths(__dirname, 'migrations');
    return readdirSync(dir).map(p => {
          let absolutePath = joinPaths(dir, p);
          let contents = readFileSync(absolutePath, 'utf8');
          let digest = createHash('sha256').update(contents).digest('hex');
          return {
                  name: p.split('.')[0],
                  digest: digest,
                  contents: contents,
                  absolutePath: absolutePath,
                }
        }).sort((a, b) => a.name < b.name ? -1 : 1);
};

export const runMigrations = async (config: DbConfig): Promise<boolean> => {
    let migrations = findMigrations();
    const client = new PgClient(config);
    await client.connect();
    for(const { name, digest, contents } of migrations) {
          let resp = await client.query(`SELECT name FROM ${config.migrationTable} WHERE digest = $1;`, [digest]).catch(() => {});
          if(resp && resp.rowCount === 1) {
                  console.log(`skipping migration ${name}`);
                  continue;
                }

          await client.query(contents).then(() => console.log(`finished migration ${name}`));
          await client.query(`INSERT INTO ${config.migrationTable}(name, digest, contents) VALUES ($1, $2, $3);`, [name, digest, contents]);
        }
    client.end();

    return true; // TODO: Actually return status if migrations fail...
};

type StatusRow = {
    name: string,
    digest: string,
    db: boolean,
    up: boolean,
};

export const viewStatus = async (config: DbConfig) => {
    const fetchMigrations = async (config: DbConfig) => {
          const migrationQuery = readFileSync(joinPaths(__dirname, 'queries', 'migrationStatus.sql'), 'utf8');
          const client = new PgClient(config);
          client.connect();
          let rawData = await client.query(migrationQuery);
          client.end();
          return rawData.rows;
        };

    let migrations = {
          up: findMigrations(),
          db: await fetchMigrations(config),
        };

    let statuses: StatusRow[] = []
    migrations.db.forEach((row) => {
          let sr = <StatusRow>{
                  name: row.name,
                  digest: row.digest,
                  db: true,
                  up: false,
                };

          if(migrations.up.find(el => el.digest === row.digest)) {
                  sr.up = true;
                }
          statuses.push(sr);
        });

    migrations.up.forEach(m => {
          if(statuses.find(el => el.digest === m.digest)) {
                  return;
                }

          let sr = <StatusRow>{
                  name: m.name,
                  digest: m.digest,
                  db: false,
                  up: true,
                };
          statuses.push(sr);
        });

    statuses.sort((a, b) => a.name < b.name ? -1 : 1);

    console.table(statuses);
};

