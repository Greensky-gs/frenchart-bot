import { Collection } from "discord.js";
import { item } from "../typings/database";
import { query } from "../utils/query";
import { log4js } from "amethystjs";

export class Shop {
    private cache: Collection<number, item & { infinite: boolean }> = new Collection();
    constructor() {
        this.start();
    }
    // Public tools
    public exists(id: number | string) {
        return !!this.getItem(id);
    }
    public getItem(id: number | string) {
        return this.cache.get(parseInt(id.toString()));
    }
    public isBuyable(id: number | string) {
        const item = this.getItem(id);
        if (!item) return false;

        return item.quantity === 0 ? true : item.left > 0;
    }

    // Core
    public async addItem({ name, price, quantity }: { name: string; price: number; quantity: number; }) {
        const item = {
            name,
            price,
            quantity,
            left: quantity,
            infinite: quantity === 0
        }
        const rs = await query(`INSERT INTO items ( name, price, quantity, left ) VALUES ( "${this.mysqlify(name)}", "${price}", "${quantity}", "${quantity}" )`).catch(log4js.trace);
        if (!rs) return "item not inserted";
    
        this.cache.set(rs.insertId, {
            ...item,
            id: rs.insertId
        });
    }
    public removeItem(id: string | number) {
        if (!this.exists(id)) return 'unknown';
        this.cache.delete(parseInt(id.toString()));

        query(`DELETE FROM items WHERE id="${id}"`);
        return true
    }
    public buy(id: number) {
        const item = this.getItem(id);
        if (!item) return 'unknown';
        if (!this.isBuyable(id)) return 'not buyable';

        item.left--;
        query(`UPDATE items SET left="${item.left}" WHERE id="${item.id}"`);
        this.cache.set(item.id, item);
    }
    public refill(id: number, quantity: 'full' | number) {
        
    }

    // Engine
    private mysqlify(text: string) {
        return text.replace(/"/g, '\\"');
    }
    private async check() {
        await query(`CREATE TABLE IF NOT EXISTS items ( id INTEGER(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), price INTEGER(255) NOT NULL, quantity INTEGER(255) NOT NULL DEFAULT '0', left INTEGER(255) NOT NULL )`);
        return true;
    }
    private async fetch() {
        const items = await query<item>(`SELECT * FROM items`);
        if (!items) return log4js.trace("No response from database when fetch items (database)")

        items.forEach((item) => {
            this.cache.set(item.id, {...item, infinite: item.quantity === 0});
        })
    }
    private async start() {
        await this.check();
        this.fetch();
    }
}