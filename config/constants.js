/** localStorage keys for the multi-account auth switcher */
export const STORAGE_KEYS = {
    ACCOUNTS: 'booking_system_accounts',
    ACTIVE_ACCOUNT_ID: 'booking_system_active_account_id',
};

/** Default booking status for new and updated bookings */
export const BOOKING_STATUS = {
    CONFIRMED: 'confirmed',
};

/**
 * Temporary default until user profiles sync from Supabase.
 * Replace with profile.restaurant_id per logged-in user.
 */
export const DEFAULT_RESTAURANT_ID = 1;

/** Local SQLite filename used by PowerSync in the browser */
export const DB_FILENAME = 'bookings.db';
