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
        .select('first_name, last_name, restaurant_id, restaurants(is_demo)')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Could not load profile:', error.message);
        return null;
    } else {
        console.log('Loaded profile:', data);
    }

    if (!data) return null;

    const restaurant = data.restaurants;
    let is_demo = Array.isArray(restaurant)
        ? restaurant[0]?.is_demo === true
        : restaurant?.is_demo === true;

    if (data.restaurant_id != null && !is_demo) {
        const { data: restaurantRow, error: restaurantError } = await supabase
            .from('restaurants')
            .select('is_demo')
            .eq('id', data.restaurant_id)
            .maybeSingle();

        if (!restaurantError && restaurantRow) {
            is_demo = restaurantRow.is_demo === true;
        }
    }

    return {
        first_name: data.first_name,
        last_name: data.last_name,
        restaurant_id: data.restaurant_id,
        is_demo,
    };
}

function getCachedProfile(userId) {
    const account = getActiveAccount();
    if (!account || account.id !== userId) return null;

    return {
        first_name: account.first_name,
        last_name: account.last_name,
        restaurant_id: account.restaurant_id,
        is_demo: account.is_demo ?? false,
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
