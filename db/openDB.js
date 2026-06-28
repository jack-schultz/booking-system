import { PowerSyncDatabase } from '@powersync/web';
import { DB_FILENAME } from '../config/constants.js';
import { AppSchema } from './schema.js';

let db;

/**
 * Opens the local PowerSync database (browser SQLite).
 * Note: db.connect() is not called yet — data stays local until sync is wired up.
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
