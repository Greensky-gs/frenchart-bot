import { Client, Guild, Role } from 'discord.js';
import { coins, query } from '../utils/query';
import { roles } from '../typings/database';
import { log4js } from 'amethystjs';

export class RolesManager {
    private cache: { role: Role; points: number }[] = [];
    private guild: Guild;
    private client: Client;

    constructor(client: Client) {
        this.client = client;

        this.start();
    }
    private async check() {
        await query(
            `CREATE TABLE IF NOT EXISTS roles ( role_id VARCHAR(255) NOT NULL PRIMARY KEY, points INTEGER(255) NOT NULL )`
        );
        return true;
    }
    private async fetch() {
        await this.client.guilds.fetch().catch(log4js.trace);
        this.guild = this.client.guilds.cache.get(process.env.serverID);

        if (!this.guild) {
            // throw new Error("Bot cannot find the server")
            return;
        }
        const roles = await query<roles>(`SELECT * FROM roles`);
        if (!roles) return log4js.trace('No response from roles query (database)');

        await this.guild.roles.fetch().catch(log4js.trace);
        roles.forEach((r) => {
            const role = this.guild.roles.cache.get(r.role_id);
            if (!role) return log4js.trace({ msg: `Role not found`, ...role });

            this.cache.push({
                role,
                points: r.points
            });
        });
    }
    private async start() {
        await this.check();
        await this.fetch();
    }
    private aboveRoles(userId: string) {
        const data = coins.getData({ user_id: userId }).coins;
        return this.cache.filter((x) => x.points > data);
    }
    private hasRolesAbove(userId: string) {
        return this.aboveRoles(userId).length > 0;
    }
    private hasRolesUnder(userId: string) {
        return this.underRoles(userId).length > 0;
    }
    private underRoles(userId: string) {
        const data = coins.getData({
            user_id: userId
        });

        return this.cache.filter((x) => x.points <= data.coins);
    }
    public addPoints(userId: string, points: number) {
        coins.addCoins({
            user_id: userId,
            coins: points
        });

        if (!this.hasRolesUnder(userId)) return 'ok';

        const member = this.guild.members.cache.get(userId);
        if (!member) return log4js.trace(`Member not found when add roles is necessary`);

        const roles = this.underRoles(userId);
        member.roles.add(roles.map((r) => r.role)).catch(log4js.trace);
    }
    public removePoints(userId: string, points: number) {
        const rs = coins.removeCoins({
            user_id: userId,
            coins: points
        });
        if (rs === 'not enough coins') return 'not enough coins';
        if (this.hasRolesAbove(userId)) {
            const member = this.guild.members.cache.get(userId);
            if (!member) return log4js.trace(`Member not fund when remove roles is necessary`);

            const roles = this.aboveRoles(userId);
            member.roles.remove(roles.map((x) => x.role)).catch(log4js.trace);
        }
    }
    public isRoleIncluded(roleId: string) {
        return !!this.cache.find((x) => x.role.id === roleId);
    }
    public addRole(roleId: string, points: number) {
        if (this.isRoleIncluded(roleId)) return true;
        const role = this.guild.roles.cache.get(roleId);
        if (!role) return 'unknown role';

        this.cache.push({
            role,
            points
        });

        query(`INSERT INTO roles ( role_id, points ) VALUES ("${role.id}", '${points}')`);
        return true;
    }
    public removeRole(role: string) {
        if (!this.isRoleIncluded(role)) return false;
        this.cache = this.cache.filter((x) => x.role.id !== role);

        query(`DELETE FROM roles WHERE role_id='${role}'`);
        return true;
    }
    public get roles() {
        return this.cache;
    }
}
