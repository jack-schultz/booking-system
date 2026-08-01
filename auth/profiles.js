import { getActiveAccount, updateAccountProfile } from './accounts.js';
import { isOnline } from '../config/connectivity.js';
import { PROFILE_SYNC_TTL_MS } from '../config/constants.js';

/**
 * Loads profile fields from public.profiles for the authenticated user.
 * Requires RLS allowing select where auth.uid() = id.
 */
export async function fetchUserProfile(supabase, userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, restaurant_id')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Could not load profile:', error.message);
        return null;
    } else {
        console.log('Loaded profile:', data);
    }

    return data;
}

function getCachedProfile(userId) {
    const account = getActiveAccount();
    if (!account || account.id !== userId) return null;

    return {
        first_name: account.first_name,
        last_name: account.last_name,
        restaurant_id: account.restaurant_id,
    };
}

function profileSyncKey(userId) {
    return `booking_system_profile_synced_at_${userId}`;
}

function isProfileSyncFresh(userId) {
    const raw = sessionStorage.getItem(profileSyncKey(userId));
    if (!raw) return false;
    const syncedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(syncedAt)) return false;
    return Date.now() - syncedAt < PROFILE_SYNC_TTL_MS;
}

function markProfileSynced(userId) {
    sessionStorage.setItem(profileSyncKey(userId), String(Date.now()));
}

/** Fetches profile from Supabase and merges into the offline account cache. */
export async function syncAccountProfileFromSupabase(supabase, userId, { force = false } = {}) {
    if (!isOnline()) {
        return getCachedProfile(userId);
    }

    if (!force && isProfileSyncFresh(userId)) {
        return getCachedProfile(userId);
    }

    const profile = await fetchUserProfile(supabase, userId);
    if (profile) {
        updateAccountProfile(userId, profile);
        markProfileSynced(userId);
    }
    return profile;
}
