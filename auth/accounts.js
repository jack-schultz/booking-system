import { STORAGE_KEYS } from '../config/constants.js';

/**
 * Supabase auth holds a lock while notifying onAuthStateChange listeners.
 * Defer follow-up auth API calls (setSession, getSession, signOut) so they do not deadlock.
 */
export function afterAuthLock(fn) {
    setTimeout(() => {
        void Promise.resolve().then(fn);
    }, 0);
}

function readAccounts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function getAccounts() {
    return readAccounts();
}

export function getActiveAccount() {
    const accounts = readAccounts();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
    return accounts.find((a) => a.id === activeId) ?? accounts[0] ?? null;
}

/** Display label for navbar and account switcher (uses cached profile names offline). */
export function getAccountDisplayName(account) {
    if (!account) return 'Not Logged In';

    const name = [account.first_name, account.last_name].filter(Boolean).join(' ');
    if (name) return name;

    return account.email ?? 'Unknown user';
}

/** Merge profile fields into a saved account without touching auth tokens. */
export function updateAccountProfile(userId, { first_name, last_name }) {
    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx < 0) return false;

    const updated = { ...accounts[idx] };
    if (first_name) updated.first_name = first_name;
    if (last_name) updated.last_name = last_name;
    accounts[idx] = updated;
    writeAccounts(accounts);
    return true;
}

export function addOrUpdateAccount(session) {
    const user = session?.user;
    if (!user) return null;

    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.id === user.id);
    const existing = idx >= 0 ? accounts[idx] : null;
    const metadata = user.user_metadata ?? {};

    const account = {
        id: user.id,
        email: user.email ?? user.id,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        first_name: existing?.first_name ?? metadata.first_name ?? null,
        last_name: existing?.last_name ?? metadata.last_name ?? null,
    };
    if (idx >= 0) {
        accounts[idx] = account;
    } else {
        accounts.push(account);
    }

    writeAccounts(accounts);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, user.id);
    return account;
}

export async function setActiveAccount(id, supabase) {
    const account = readAccounts().find((a) => a.id === id);
    if (!account) return false;

    const previousActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, id);

    const { data, error } = await supabase.auth.setSession({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });

    if (error) {
        if (previousActiveId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, previousActiveId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
        }
        console.warn('Could not switch account:', error.message);
        return false;
    }

    if (data.session) {
        addOrUpdateAccount(data.session);
    }
    return true;
}

export async function migrateExistingSession(supabase) {
    const accounts = readAccounts();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        addOrUpdateAccount(session);
        return;
    }
    if (accounts.length === 0) return;

    const active = getActiveAccount();
    if (active) await setActiveAccount(active.id, supabase);
}

export async function removeActiveAccount(supabase) {
    const active = getActiveAccount();
    if (!active) return null;

    const remaining = readAccounts().filter((a) => a.id !== active.id);
    writeAccounts(remaining);

    if (remaining.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID);
        await supabase.auth.signOut();
        return null;
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, remaining[0].id);
    await setActiveAccount(remaining[0].id, supabase);
    return remaining[0];
}
