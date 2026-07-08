import { PowerSyncDatabase } from '@powersync/web';
import { DB_FILENAME } from '../config/constants.js';
import { AppSchema } from './schema.js';

const GLOBAL_DB_KEY = '__booking_system_powersync_db__';
const GLOBAL_DB_OPEN_KEY = '__booking_system_powersync_db_open__';

/**
 * Opens the local PowerSync database (browser SQLite).
 * Call connectSync() after login to stream data from Supabase via PowerSync Cloud.
 * See docs/powersync-supabase.md.
 *
 * Singleton is stored on globalThis so Vite HMR does not create a second instance
 * that deadlocks on the same IndexedDB / navigator lock while the old one is still initing.
 *
 * Prefer initDatabase() — it runs db.init() and migrations. openDB() alone returns an
 * instance that may not be ready yet.
 */
export async function openDB() {
    if (globalThis[GLOBAL_DB_KEY]) {
        return globalThis[GLOBAL_DB_KEY];
    }

    if (!globalThis[GLOBAL_DB_OPEN_KEY]) {
        globalThis[GLOBAL_DB_OPEN_KEY] = (async () => {
            if (!globalThis[GLOBAL_DB_KEY]) {
                globalThis[GLOBAL_DB_KEY] = new PowerSyncDatabase({
                    schema: AppSchema,
                    database: {
                        dbFilename: DB_FILENAME,
                    },
                });
            }
        })();
    }

    await globalThis[GLOBAL_DB_OPEN_KEY];
    return globalThis[GLOBAL_DB_KEY];
}
