import { config } from 'dotenv';
import { createConnection } from 'mysql';
import { DefaultQueryResult, QueryResult } from '../typings/database';
import { CoinsManager } from 'coins-manager';
import { StaffsManager } from '../structures/StaffManager';
import { VoiceManager } from '../structures/VoiceStats';
import { RolesManager } from '../structures/RolesManager';
import { client } from '..';
config();

const database = createConnection({
    user: process.env.dbu,
    host: process.env.dbh,
    password: process.env.dbp,
    database: process.env.db
});

database.connect((error) => {
    if (error) {
        throw error;
    }
});

export const query = <T extends any = DefaultQueryResult>(query: string): Promise<QueryResult<T>> => {
    return new Promise((resolve, reject) => {
        database.query(query, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

export const coins = new CoinsManager(database, { type: 'global' });
coins.start();

export const staffs = new StaffsManager(process.env.serverOwner);
export const voiceStats = new VoiceManager();
export const roles = new RolesManager(client);
