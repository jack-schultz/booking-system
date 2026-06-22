import { migrations } from "./migrations";

export async function runMigrations(db) {
    // ensure tracking table exists
    await db.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // get already applied migrations
    const result = await db.query(`
        SELECT name FROM migrations
    `);

    const applied = new Set(result.rows.map(r => r.name));

    for (const migration of migrations) {
        if (applied.has(migration.name)) continue;

        console.log(`Running migration: ${migration.name}`);

        await db.transaction(async (tx) => {
            await migration.up(tx);

            await tx.execute(
                `INSERT INTO migrations (name) VALUES (?)`,
                [migration.name]
            );
        });
    }
}
