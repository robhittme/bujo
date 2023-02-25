import { Db } from './lib';
import { DbConfig } from '../config';

export const initPool = (config: DbConfig): Db => {
    const {Pool} = require('pg');
    const pool = new Pool(config);

    pool.connect()
        .catch((err: Error) => console.error('DB connection error', err.stack));

    process.on('SIGINT', () => pool.then(process.exit()));
    return Db(pool);
}

