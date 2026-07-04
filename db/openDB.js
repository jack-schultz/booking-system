import { PowerSyncDatabase } from '@powersync/web';
import { DB_FILENAME } from '../config/constants.js';
import { AppSchema } from './schema.js';

let db;

/**
 * Opens the local PowerSync database (browser SQLite).
 * Call connectSync() after login to stream data from Supabase via PowerSync Cloud.
 * See docs/powersync-supabase.md.
 */
export async function openDB() {
    if (db) return db;

    db = new PowerSyncDatabase({
        schema: AppSchema,
        database: {
            dbFilename: DB_FILENAME,
        },
    });

    return db;
}
