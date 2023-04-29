import { Collection } from 'discord.js';
import { inventory, item } from '../typings/database';
import { query } from '../utils/query';
import { log4js } from 'amethystjs';

export class Inventory {
    private _cache: Collection<string, inventory<false>> = new Collection();

    constructor() {
        this.start();
    }
    // Public tools
    public get cache() {
        return this._cache;
    }
    public getInventory(userId: string) {
        return this._cache.get(userId) ?? { user_id: userId, items: [] };
    }
    public hasInventory(userId: string) {
        return this._cache.has(userId);
    }

    // Core
    public pushItem(userId: string, item: item) {
        const exists = this.hasInventory(userId);
        this._cache.set(userId, {
            user_id: userId,
            items: [...this.getInventory(userId).items, item]
        });

        this.update(userId, exists);
        return true;
    }
    public removeItem(userId: string, id: number) {
        const inventory = this.getInventory(userId);
        const item = inventory.items.find((i) => i.id === id);
        if (!item) return 'User has no item with this id';

        this._cache.set(userId, {
            user_id: userId,
            items: inventory.items.filter((x) => x.id !== id)
        });
        this.update(userId);
        return true;
    }

    // Engine
    private buildQuery(userId: string, exists = true) {
        if (exists) {
            return `UPDATE inventories SET items='${JSON.stringify(this.getInventory(userId).items).replace(
                /'/g,
                "\\'"
            )}' WHERE user_id="${userId}"`;
        } else {
            return `INSERT INTO inventories ( user_id, items ) VALUES ( "${userId}", '${JSON.stringify(
                this.getInventory(userId).items
            ).replace(/'/g, "\\'")}' )`;
        }
    }
    private update(userId: string, exists = true) {
        return query(this.buildQuery(userId, exists));
    }
    private async check() {
        await query(
            `CREATE TABLE IF NOT EXISTS inventories ( user_id VARCHAR(255) NOT NULL PRIMARY KEY, items LONGTEXT )`
        );
        return true;
    }
    private async fetch() {
        const items = await query<inventory<true>>(`SELECT * FROM inventories`);
        if (!items) return log4js.trace('No response from database when fetch inventories (database)');

        items.forEach((inventory) => {
            this._cache.set(inventory.user_id, {
                items: JSON.parse(inventory.items),
                user_id: inventory.user_id
            });
        });
    }
    private async start() {
        await this.check();
        this.fetch();
    }
}
