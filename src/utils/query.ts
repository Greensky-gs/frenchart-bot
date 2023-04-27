import { config } from 'dotenv'
import { createConnection } from 'mysql'
import { DefaultQueryResult, QueryResult } from '../typings/database';
import { CoinsManager } from 'coins-manager';
config()

const database = createConnection({
    user: process.env.dbu,
    host: process.env.dbh,
    password: process.env.dbp,
    database: process.env.db
});

database.connect((error) => {
    if (error) {
        throw error
    }
})

export const query = <T extends any = DefaultQueryResult>(query: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
        database.query(query, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        })
    })
}

export const coins = new CoinsManager(database, { type: 'global' });
coins.start();