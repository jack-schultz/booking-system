import { PowerSyncDatabase } from '@powersync/web';
import { DB_FILENAME } from '../config/constants.js';
import { AppSchema } from './schema.js';

const GLOBAL_DB_KEY = '__booking_system_powersync_db__';

/**
 * Opens the local PowerSync database (browser SQLite).
 * Call connectSync() after login to stream data from Supabase via PowerSync Cloud.
 * See docs/powersync-supabase.md.
 *
 * Singleton is stored on globalThis so Vite HMR does not create a second instance
 * that deadlocks on the same IndexedDB / navigator lock while the old one is still initing.
 */
export async function openDB() {
    if (globalThis[GLOBAL_DB_KEY]) {
        return globalThis[GLOBAL_DB_KEY];
    }

    const db = new PowerSyncDatabase({
        schema: AppSchema,
        database: {
            dbFilename: DB_FILENAME,
        },
    });

    globalThis[GLOBAL_DB_KEY] = db;
    return db;
}
