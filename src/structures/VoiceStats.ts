import { Collection } from 'discord.js';
import { query } from '../utils/query';
import { voice } from '../typings/database';
import { log4js } from 'amethystjs';

export class VoiceManager {
    private _cache: Collection<string, number> = new Collection();
    constructor() {
        this.start();
    }

    public get cache() {
        return this._cache;
    }

    /**
     * Ajoute du temps à un utilisateur
     * @param userId User id
     * @param time Time in milliseconds
     */
    public addTime(userId: string, time: number) {
        const data = this.getUser(userId);
        this._cache.set(userId, data + time);

        query(
            `INSERT INTO voice (user_id, total) VALUES ("${userId}", "${this._cache.get(
                userId
            )}") ON DUPLICATE KEY UPDATE total='${this._cache.get(userId)}'`
        );
        return this.getUser(userId);
    }
    public getUser(userId: string, fillIfEmpty?: boolean) {
        const data = this._cache.get(userId);
        if (!data) {
            if (!!fillIfEmpty) this.addTime(userId, 0);
            return 0;
        }
        return data;
    }
    public get leaderboard() {
        return this._cache.map((v, k) => ({ id: k, total: v })).sort((a, b) => b.total - a.total);
    }
    private async checkDb() {
        await query(
            "CREATE TABLE IF NOT EXISTS voice ( user_id VARCHAR(255) NOT NULL PRIMARY KEY, total INTEGER(255) NOT NULL DEFAULT '0' ) "
        );
        return true;
    }
    private async fetch() {
        const res = await query<voice>('SELECT * FROM voice');
        if (!res) return log4js.trace('No data from voice table (database)');

        res.forEach((re) => {
            this._cache.set(re.user_id, re.total);
        });
    }
    private async start() {
        await this.checkDb();
        this.fetch();
    }
}
