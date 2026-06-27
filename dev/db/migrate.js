import { migrations } from './migrations/index.js';

export async function runMigrations(db) {
    await db.init();

    const result = await db.query(`SELECT name FROM migrations`);
    const applied = new Set(result.rows?.map((r) => r.name) ?? []);

    for (const migration of migrations) {
        if (applied.has(migration.name)) continue;

        console.log(`Running migration: ${migration.name}`);

        await db.writeTransaction(async (tx) => {
            await migration.up(tx);
            await tx.execute(`INSERT INTO migrations (id, name) VALUES (uuid(), ?)`, [
                migration.name,
            ]);
        });
    }
}
