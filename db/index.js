import { openDB } from './openDB.js';
import { runMigrations } from './migrate.js';
import { connectSync, reconnectSync, disconnectSync } from './sync.js';

export { connectSync, reconnectSync, disconnectSync };

export async function initDatabase() {
    const db = await openDB();
    await runMigrations(db);
    return db;
}

/** Open the local DB and connect to PowerSync when online and assigned to a restaurant. */
export async function initDatabaseAndSync() {
    const db = await initDatabase();
    await connectSync(db);
    return db;
}

export async function ensureSyncConnected(db) {
    return connectSync(db);
}
