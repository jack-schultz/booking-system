import { migrations } from './migrations/index.js';

export async function runMigrations(db) {
    await db.init();

    const rows = await db.getAll(`SELECT name FROM migrations`);
    const applied = new Set(rows.map((r) => r.name));
    console.log("Applied migration steps:", applied)

    for (const migration of migrations) {
        if (applied.has(migration.name)) {
            console.log(`Migration already complete: ${migration.name}`);
            continue;
        }

        console.log(`Running migration: ${migration.name}`);

        await db.writeTransaction(async (tx) => {
            await migration.up(tx);
            await tx.execute(`INSERT INTO migrations (id, name) VALUES (uuid(), ?)`, [
                migration.name,
            ]);
        });
    }
}
