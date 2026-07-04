import { hasAssignedRestaurant } from '../auth/accounts.js';
import { isOnline } from '../config/connectivity.js';
import { supabase } from '../supabaseClient.js';
import { supabaseConnector } from './supabaseConnector.js';

const POWERSYNC_URL = import.meta.env.VITE_POWERSYNC_URL;

let connecting = false;

/**
 * PowerSync cannot connect without an instance URL. This lets the app skip sync calls
 * in local dev or when the env var is missing.
 */
export function isSyncConfigured() {
    return Boolean(POWERSYNC_URL);
}

/**
 * Starts syncing when the app is ready.
 * PowerSync handles the heavy lifting once connected: keeping local SQLite in sync
 * with Postgres, queuing offline writes, and calling supabaseConnector to upload
 * changes and fetchCredentials to authenticate. This file only decides when to
 * call db.connect(). We require a logged-in Supabase session, network, a configured
 * PowerSync URL, and an assigned restaurant_id (sync rules are scoped per restaurant).
 * The app calls this after login and on pages that need live data. it does not run
 * automatically on its own.
 */
export async function connectSync(db) {
    if (!isSyncConfigured() || !isOnline()) {
        return false;
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();
    // No restaurant_id yet = sync rules won't match anything useful, so don't connect.
    if (!session || !hasAssignedRestaurant()) {
        return false;
    }

    // Skip if already connected or a connect() is in flight — avoids double-connect races.
    if (db.connected || connecting) {
        return db.connected;
    }

    connecting = true;
    try {
        await db.connect(supabaseConnector);
        return true;
    } catch (err) {
        console.warn('PowerSync connect failed:', err);
        return false;
    } finally {
        connecting = false;
    }
}

/**
 * Stops the active PowerSync connection.
 * PowerSync does not disconnect when the user switches accounts, logs out, or goes
 * offline. This is needed so the old session stops downloading/uploading
 * before a new one is opened.
 */
export async function disconnectSync(db) {
    if (!db.connected) {
        return;
    }

    try {
        await db.disconnect();
    } catch (err) {
        console.warn('PowerSync disconnect failed:', err);
    }
}

/**
 * Restarts sync from scratch (disconnect then connect).
 * Needed after account switch or token refresh because PowerSync must re-authenticate
 * with fetchCredentials and re-subscribe to the new user's restaurant-scoped stream.
 * PowerSync does not detect those auth changes on its own.
 */
export async function reconnectSync(db) {
    if (!isOnline()) {
        return false;
    }
    await disconnectSync(db);
    return connectSync(db);
}
