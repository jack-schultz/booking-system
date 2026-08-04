/** localStorage keys for the multi-account auth switcher */
export const STORAGE_KEYS = {
    ACCOUNTS: 'booking_system_accounts',
    ACTIVE_ACCOUNT_ID: 'booking_system_active_account_id',
    MANAGER_SELECTED_DATE: 'booking_system_manager_selected_date',
};

/** Default booking status for new and updated bookings */
export const BOOKING_STATUS = {
    PENDING: 'pending',
    SET: 'set',
    SEATED: 'seated',
};

/**
 * Fallback when a profile has not synced restaurant_id from Supabase yet.
 */
export const DEFAULT_RESTAURANT_ID = 0;

const DEV_DB_FILENAME = 'bookings-dev.db';
const PROD_DB_FILENAME = 'bookings.db';

function resolveDbFilename() {
    const env = import.meta.env ?? {};
    if (env.VITE_DB_FILENAME) {
        return env.VITE_DB_FILENAME;
    }
    const base = env.BASE_URL ?? '/';
    if (base === '/dev/' || base.startsWith('/dev/')) {
        return DEV_DB_FILENAME;
    }
    return PROD_DB_FILENAME;
}

/** Local SQLite filename used by PowerSync in the browser */
export const DB_FILENAME = resolveDbFilename();

/** Skip Supabase profile fetch when cache is fresher than this (ms). */
export const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;
