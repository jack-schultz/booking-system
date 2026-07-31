import { isDemoAccount, signInAsDemo } from './demoMode.js';

describe('isDemoAccount', () => {
    test('returns true when is_demo is true', () => {
        expect(isDemoAccount({ is_demo: true })).toBe(true);
    });

    test('returns false when is_demo is false', () => {
        expect(isDemoAccount({ is_demo: false })).toBe(false);
    });

    test('returns false for null account', () => {
        expect(isDemoAccount(null)).toBe(false);
    });

    test('returns false when is_demo is omitted', () => {
        expect(isDemoAccount({ id: 'user-1', email: 'user@example.com' })).toBe(false);
    });

    test('returns true when email matches VITE_DEMO_EMAIL', () => {
        const demoEmail = import.meta.env?.VITE_DEMO_EMAIL;
        if (!demoEmail) {
            return;
        }

        expect(isDemoAccount({ email: demoEmail, is_demo: false })).toBe(true);
    });
});

describe('signInAsDemo', () => {
    test('throws when demo env vars are missing', async () => {
        let called = false;
        const supabase = {
            auth: {
                signInWithPassword: async () => {
                    called = true;
                    return { data: null, error: null };
                },
            },
        };

        await expect(signInAsDemo(supabase)).rejects.toThrow('Demo is not configured');
        expect(called).toBe(false);
    });

    test('calls signInWithPassword with env credentials when configured', async () => {
        const email = import.meta.env?.VITE_DEMO_EMAIL;
        const password = import.meta.env?.VITE_DEMO_PASSWORD;
        if (!email || !password) {
            return;
        }

        let receivedCredentials = null;
        const supabase = {
            auth: {
                signInWithPassword: async (credentials) => {
                    receivedCredentials = credentials;
                    return {
                        data: { session: { user: { id: 'demo-user' } } },
                        error: null,
                    };
                },
            },
        };

        const result = await signInAsDemo(supabase);

        expect(receivedCredentials).toEqual({ email, password });
        expect(result.error).toBeNull();
    });
});
