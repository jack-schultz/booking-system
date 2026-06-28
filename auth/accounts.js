import { STORAGE_KEYS } from '../config/constants.js';

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

export function addOrUpdateAccount(session) {
    const user = session?.user;
    if (!user) return null;

    const account = {
        id: user.id,
        email: user.email ?? user.id,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
    };

    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.id === user.id);
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

    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT_ID, id);

    const { error } = await supabase.auth.setSession({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
    });
    if (error) return false;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) addOrUpdateAccount(session);
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
