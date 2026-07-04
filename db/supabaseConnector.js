import { UpdateType } from '@powersync/web';
import { supabase } from '../supabaseClient.js';
import { recordSyncIssue } from './syncStatus.js';

const POWERSYNC_URL = import.meta.env.VITE_POWERSYNC_URL;

/** Postgres errors that should not block the upload queue.
 *  22xxx = bad data (wrong type etc), 23xxx = constraint violations, 42501 = permission denied.
 *  If we don't discard these, PowerSync retries the same broken op every few seconds forever. */
const FATAL_RESPONSE_CODES = [
    /^22...$/,
    /^23...$/,
    /^42501$/,
];

/**
 * Gives PowerSync Cloud the credentials it needs to open a sync connection.
 * PowerSync does not log users in or refresh tokens itself. It calls this whenever
 * it needs to connect or re-authenticate. We read the current Supabase session and
 * return the PowerSync instance URL plus the JWT access token (PowerSync Cloud is
 * configured to trust Supabase Auth). Returns null if nobody is logged in.
 */
async function fetchCredentials() {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) {
        throw new Error(`Could not fetch Supabase credentials: ${error.message}`);
    }

    if (!session) {
        return null;
    }

    if (!POWERSYNC_URL) {
        throw new Error('VITE_POWERSYNC_URL is not configured');
    }

    return {
        endpoint: POWERSYNC_URL,
        token: session.access_token,
        expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000)
            : undefined,
    };
}

/**
 * Uploads local changes from the browser to Supabase Postgres.
 * PowerSync automatically tracks every write the app makes to local SQLite (inserts,
 * updates, deletes) and queues them while offline. Downloading data from Postgres
 * is also automatic. PowerSync Cloud applies sync rules and streams rows into
 * local SQLite without any code here. Upload is manual, we follow these steps:
 * drain the queue, translate each queued op into a Supabase REST call (upsert /
 * update / delete), and call transaction.complete() so PowerSync marks it synced.
 * Unrecoverable Postgres errors are discarded so a bad row does not block the queue.
 */
async function uploadData(database) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
        return;
    }

    let lastOp = null;

    try {
        for (const op of transaction.crud) {
            lastOp = op;

            if (op.table !== 'bookings') {
                throw new Error(`Unexpected sync table: ${op.table}`);
            }

            const table = supabase.from(op.table);
            let result = null;

            switch (op.op) {
                case UpdateType.PUT: {
                    // PUT = full row insert/replace; merge op.id in case opData doesn't include it.
                    const record = { ...op.opData, id: op.id };
                    result = await table.upsert(record);
                    break;
                }
                case UpdateType.PATCH:
                    result = await table.update(op.opData).eq('id', op.id);
                    break;
                case UpdateType.DELETE:
                    result = await table.delete().eq('id', op.id);
                    break;
                default:
                    throw new Error(`Unsupported sync operation: ${op.op}`);
            }

            if (result?.error) {
                throw result.error;
            }
        }

        await transaction.complete();
    } catch (ex) {
        if (typeof ex.code === 'string' && FATAL_RESPONSE_CODES.some((re) => re.test(ex.code))) {
            console.error('Data upload error - discarding transaction:', lastOp, ex);
            recordSyncIssue({
                type: 'upload_discarded',
                message: `Upload discarded: ${ex.message ?? 'fatal Postgres error'}`,
                detail: { op: lastOp, code: ex.code },
            });
            // Still complete() so PowerSync drops this transaction from the queue instead of retrying.
            await transaction.complete();
            return;
        }

        recordSyncIssue({
            type: 'upload_error',
            message: ex.message ?? 'Upload failed',
            detail: { op: lastOp, code: ex.code },
        });
        throw ex;
    }
}

export const supabaseConnector = {
    fetchCredentials,
    uploadData,
};
