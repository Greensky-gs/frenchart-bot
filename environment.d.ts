declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            db: string;
            dbh: string;
            dbu: string;
            dbp: string;
            serverOwner: string;
            serverID: string;
        }
    }
}

export {};