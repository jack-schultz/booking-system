import { updateAccountProfile } from './accounts.js';

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

/** Fetches profile from Supabase and merges into the offline account cache. */
export async function syncAccountProfileFromSupabase(supabase, userId) {
    const profile = await fetchUserProfile(supabase, userId);
    if (profile) {
        updateAccountProfile(userId, profile);
    }
    return profile;
}
