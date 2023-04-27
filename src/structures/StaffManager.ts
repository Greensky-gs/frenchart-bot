import { log4js } from 'amethystjs';
import { staffs } from '../typings/database';
import { query } from '../utils/query';

export class StaffsManager {
    private _cache: string[];
    private _ownerId: string;

    constructor(ownerId: string) {
        this._ownerId = ownerId;
        this.start();
    }
    public get cache() {
        return this._cache;
    }
    public get ownerId() {
        return this._ownerId;
    }

    public isOwner(userId: string) {
        return userId === this._ownerId;
    }
    public isStaff(userId: string) {
        if (userId === this._ownerId) return true;
        return this._cache.includes(userId);
    }
    public addStaff(userId: string) {
        if (this.isStaff(userId)) return this;
        this._cache.push(userId);

        query(`INSERT INTO staffs ( user_id ) VALUES ("${userId}")`);
        return this;
    }
    public removeStaff(userId: string) {
        if (!this.isStaff(userId)) return false;
        if (userId === this._ownerId) return false;

        this._cache = this._cache.filter((x) => x !== userId);
        query(`DELETE FROM staffs WHERE user_id='${userId}'`);
        return this;
    }

    private async checkDb() {
        await query(`CREATE TABLE IF NOT EXISTS staffs ( user_id VARCHAR(255) NOT NULL PRIMARY KEY )`);
        return true;
    }
    private async fillCache() {
        const data = await query<staffs>(`SELECT * FROM staffs`);
        if (!data) return log4js.trace('No data in the cache for staffs');

        this._cache = data.map((x) => x.user_id);
    }
    private async start() {
        await this.checkDb();
        this.fillCache();
    }
}
