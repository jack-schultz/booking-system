import { openDB } from './openDB.js';
import { runMigrations } from './migrate.js';
import { connectSync, reconnectSync, disconnectSync } from './sync.js';

export { connectSync, reconnectSync, disconnectSync };

const GLOBAL_DB_INIT_KEY = '__booking_system_powersync_db_init__';

export async function initDatabase() {
    if (!globalThis[GLOBAL_DB_INIT_KEY]) {
        globalThis[GLOBAL_DB_INIT_KEY] = (async () => {
            try {
                const db = await openDB();
                await runMigrations(db);
            } catch (err) {
                globalThis[GLOBAL_DB_INIT_KEY] = null;
                throw err;
            }
        })();
    }

    await globalThis[GLOBAL_DB_INIT_KEY];
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
