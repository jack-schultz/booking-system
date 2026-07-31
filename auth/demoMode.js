import { getActiveAccount } from './accounts.js';

const DEMO_NOT_CONFIGURED = 'Demo is not configured. Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD.';

/**
 * @param {{ auth: { signInWithPassword: (credentials: { email: string, password: string }) => Promise<{ data: object, error: Error | null }> } }} supabase
 */
export async function signInAsDemo(supabase) {
    const email = import.meta.env?.VITE_DEMO_EMAIL;
    const password = import.meta.env?.VITE_DEMO_PASSWORD;

    if (!email || !password) {
        throw new Error(DEMO_NOT_CONFIGURED);
    }

    return supabase.auth.signInWithPassword({ email, password });
}

/**
 * @param {{ is_demo?: boolean, email?: string } | null | undefined} [account]
 * @returns {boolean}
 */
export function isDemoAccount(account = getActiveAccount()) {
    if (!account) return false;
    if (account.is_demo === true) return true;

    const demoEmail = import.meta.env?.VITE_DEMO_EMAIL;
    if (demoEmail && account.email?.toLowerCase() === demoEmail.toLowerCase()) {
        return true;
    }

    return false;
}

/**
 * @param {{ auth: { signInWithPassword: (credentials: { email: string, password: string }) => Promise<{ data: object, error: Error | null }> } }} supabase
 * @param {{ onError?: (error: Error) => void, redirectTo?: string }} [options]
 */
export function wireDemoModeButton(supabase, { onError, redirectTo = 'booking/manager' } = {}) {
    document.querySelectorAll('.demo-mode-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                const { data, error } = await signInAsDemo(supabase);
                if (error) {
                    throw error;
                }
                const { registerLoggedInSession } = await import('./accountSwitcher.js');
                await registerLoggedInSession(supabase, data.session);
                window.location.href = redirectTo;
            } catch (err) {
                onError?.(err instanceof Error ? err : new Error(String(err)));
            } finally {
                btn.disabled = false;
            }
        });
    });
}
