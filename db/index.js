import { openDB } from './openDB.js';
import { runMigrations } from './migrate.js';

export async function initDatabase() {
    const db = await openDB();

    await runMigrations(db);

    return db;
}
