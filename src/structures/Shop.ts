import { Collection } from "discord.js";
import { item, itemType } from "../typings/database";
import { query } from "../utils/query";
import { log4js } from "amethystjs";

export class Shop {
    private cache: Collection<number, item & { infinite: boolean }> = new Collection();
    constructor() {
        this.start();
    }
    // Public tools
    public get items() {
        return this.cache;
    }
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
    public async addItem({ name, price, quantity, type, roleId = '' }: { name: string; price: number; quantity: number; type: itemType; roleId?: string; }) {
        const item = {
            name,
            price,
            quantity,
            left: quantity,
            infinite: quantity === 0,
            type,
            role_id: roleId
        }
        const rs = await query(`INSERT INTO items ( name, price, quantity, \`left\`, type, role_id ) VALUES ( "${this.mysqlify(name)}", "${price}", "${quantity}", "${quantity}", "${type}", "${roleId}" )`).catch(log4js.trace);
        if (!rs) return "item not inserted";
    
        this.cache.set(rs.insertId, {
            ...item,
            id: rs.insertId
        });
    }
    public removeItem(id: string | number) {
        if (!this.exists(id)) return 'unknown';
        const item = this.getItem(id);
        this.cache.delete(parseInt(id.toString()));

        query(`DELETE FROM items WHERE id="${id}"`);
        return item;
    }
    public buy(id: number) {
        const item = this.getItem(id);
        if (!item) return 'unknown';
        if (!this.isBuyable(id)) return 'not buyable';

        item.left--;
        query(`UPDATE items SET \`left\`="${item.left}" WHERE id="${item.id}"`);
        this.cache.set(item.id, item);
    }
    public refill(id: number, quantity: 'full' | number) {
        if (!this.exists(id)) return 'unexisting item';
        if (this.getItem(id).infinite) return 'infinite item'
        this.cache.set(id, {
            left: quantity === 'full' ? this.getItem(id).quantity : quantity,
            ...this.cache.get(id)
        });

        query(`UPDATE items SET \`left\`="${this.getItem(id).left}" WHERE id="${id}"`);
        return this.getItem(id);
    }
    public updateQuantity(id: number, quantity: number) {
        if (!this.exists(id)) return 'unexisting item';
        const item = this.getItem(id);
        item.quantity = Math.abs(quantity);
        item.infinite = Math.abs(quantity) === 0;

        if (item.quantity < item.left) item.left = item.quantity;
        this.cache.set(id, item);

        query(`UPDATE items SET quantity='${quantity}', \`left\`="${item.left}" WHERE id='${id}'`);
        return item;
    }
    public updateName(id: number, name: string) {
        if (!this.exists(id)) return 'unexisting item';
        const item = this.getItem(id);
        item.name = name;

        this.cache.set(id, item);
        query(`UPDATE items SET name="${this.mysqlify(name)}" WHERE id="${id}"`);
        return item;
    }
    public updateRole(id: number, roleId: string) {
        if (this.exists(id)) return 'unexisting item'
        const item = this.getItem(id)
        if (item.type === 'role') return 'item not role'

        item.role_id = roleId;
        this.cache.set(id, item)
        query(`UPDATE items SET role_id="${roleId}" WHERE id='${id}'`)

        return item;
    }

    // Engine
    private mysqlify(text: string) {
        return text.replace(/"/g, '\\"');
    }
    private async check() {
        await query(`CREATE TABLE IF NOT EXISTS items ( id INTEGER(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), price INTEGER(255) NOT NULL, quantity INTEGER(255) NOT NULL DEFAULT '0', \`left\` INTEGER(255) NOT NULL, type VARCHAR(255) NOT NULL, role_id VARCHAR(255) )`);
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