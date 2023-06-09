import { If } from 'discord.js';

export type DefaultQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
export type QueryResult<T> = T extends DefaultQueryResult ? DefaultQueryResult : T[];
export type staffs = {
    user_id: string;
};
export type voice = {
    user_id: string;
    total: number;
};
export type roles = {
    role_id: string;
    points: number;
};
export type itemType = 'role' | 'text';
export type item = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    left: number;
    type: itemType;
    role_id: null | string;
};
export type inventory<Raw extends boolean = true> = {
    user_id: string;
    items: If<Raw, string, item[]>;
};
