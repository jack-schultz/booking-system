import { openDB } from './openDB.js';
import { runMigrations } from './migrate.js';
import { connectSync, reconnectSync, disconnectSync } from './sync.js';

export { connectSync, reconnectSync, disconnectSync };

let databaseInitPromise = null;

export async function initDatabase() {
    if (databaseInitPromise) {
        await databaseInitPromise;
        return openDB();
    }

    databaseInitPromise = (async () => {
        const db = await openDB();
        await runMigrations(db);
    })();

    try {
        await databaseInitPromise;
    } catch (err) {
        databaseInitPromise = null;
        throw err;
    }

    return openDB();
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
