import { PowerSyncDatabase } from '@powersync/web';
import { AppSchema } from './schema.js';

let db;

export async function openDB() {
    if (db) return db;

    db = new PowerSyncDatabase({
        schema: AppSchema,
        database: {
            dbFilename: 'bookings.db',
        }
    });

    return db;
}
