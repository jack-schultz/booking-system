export const migration_001_init = {
    name: "001_init",

    async up(db) {
        await db.execute(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
};
