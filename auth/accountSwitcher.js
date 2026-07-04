import { supabase } from "../supabaseClient.js";
import { DEFAULT_RESTAURANT_ID } from "../config/constants.js";
import { isOnline } from "../config/connectivity.js";
import {
    addOrUpdateAccount,
    afterAuthLock,
    getAccountDisplayName,
    getAccounts,
    getActiveAccount,
    hasAssignedRestaurant,
    migrateExistingSession,
    removeActiveAccount,
    setActiveAccount,
} from "./accounts.js";
import { syncAccountProfileFromSupabase } from "./profiles.js";

let dropdownRender = null;

async function reconnectPowerSync() {
    // Lazy-import to avoid circular deps at module load (accountSwitcher <-> sync <-> accounts).
    const { openDB } = await import("../db/openDB.js");
    const { reconnectSync } = await import("../db/sync.js");
    const db = await openDB();
    await reconnectSync(db);
}

async function disconnectPowerSync() {
    const { openDB } = await import("../db/openDB.js");
    const { disconnectSync } = await import("../db/sync.js");
    const db = await openDB();
    await disconnectSync(db);
}

function setupOnlineSync() {
    window.addEventListener("online", () => {
        afterAuthLock(async () => {
            await migrateExistingSession(supabase);
            const active = getActiveAccount();
            if (active) {
                // Admin may have assigned a restaurant while we were offline — refresh before syncing.
                await syncAccountProfileFromSupabase(supabase, active.id);
                dropdownRender?.();
            }
            await reconnectPowerSync();
        });
    });
}

function setupDropdown(triggerEl, { loginRedirect, onSwitch }) {
    const wrapper = document.createElement("div");
    wrapper.className = "navbar-account-switcher";
    triggerEl.parentNode.insertBefore(wrapper, triggerEl);
    wrapper.appendChild(triggerEl);

    triggerEl.href = "#";
    triggerEl.classList.add("navbar-account-trigger");

    const dropdown = document.createElement("div");
    dropdown.className = "navbar-account-dropdown";
    dropdown.hidden = true;
    wrapper.appendChild(dropdown);

    triggerEl.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.hidden = !dropdown.hidden;
    });

    document.addEventListener("click", () => {
        dropdown.hidden = true;
    });

    dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    function render() {
        const active = getActiveAccount();
        triggerEl.textContent = getAccountDisplayName(active);

        dropdown.innerHTML = "";

        for (const account of getAccounts()) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "navbar-account-option";
            if (account.id === active?.id) {
                btn.classList.add("is-active");
            }
            btn.textContent = getAccountDisplayName(account);
            btn.addEventListener("click", () => {
                const accountId = account.id;
                dropdown.hidden = true;
                afterAuthLock(async () => {
                    const ok = await setActiveAccount(accountId, supabase);
                    if (!ok) return;
                    if (isOnline()) {
                        await syncAccountProfileFromSupabase(supabase, accountId);
                    }
                    // Different user means different restaurant_id scope. Reconnect so PowerSync streams the right bookings.
                    await reconnectPowerSync();
                    render();
                    onSwitch?.(getActiveAccount());
                });
            });
            dropdown.appendChild(btn);
        }

        const addLink = document.createElement("a");
        addLink.className = "navbar-account-add-link";
        addLink.href = loginRedirect;
        addLink.textContent = "Add account";
        dropdown.appendChild(addLink);
    }

    render();
    return render;
}

export { hasAssignedRestaurant };

export function getActiveProfileId() {
    return getActiveAccount()?.id ?? null;
}

export function getActiveRestaurantId() {
    return getActiveAccount()?.restaurant_id ?? DEFAULT_RESTAURANT_ID;
}

export async function initAccountSwitcher(options = {}) {
    const {
        requireAuth = false,
        loginRedirect = "../login.html",
        onSwitch = null,
    } = options;

    const triggerEl = document.getElementById("logged_in_user");
    if (!triggerEl) return null;

    dropdownRender = setupDropdown(triggerEl, { loginRedirect, onSwitch });

    setupOnlineSync();

    // Populate session from localStorage before registering the listener — otherwise the first auth event sees no user.
    await migrateExistingSession(supabase);

    supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === "TOKEN_REFRESHED" || event === "SIGNED_IN")) {
            addOrUpdateAccount(session);
            afterAuthLock(async () => {
                await syncAccountProfileFromSupabase(supabase, session.user.id);
                dropdownRender?.();
                if (event === "TOKEN_REFRESHED") {
                    await reconnectPowerSync();
                }
            });
        }
    });

    const active = getActiveAccount();
    if (active && isOnline()) {
        await syncAccountProfileFromSupabase(supabase, active.id);
    }
    dropdownRender?.();

    if (requireAuth && !active) {
        window.location.href = loginRedirect;
        return null;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            afterAuthLock(async () => {
                const remaining = await removeActiveAccount(supabase);
                if (!remaining) {
                    await disconnectPowerSync();
                    window.location.href = loginRedirect;
                    return;
                }
                await reconnectPowerSync();
                dropdownRender?.();
            });
        });
    }

    return getActiveAccount();
}

export async function registerLoggedInSession(supabaseClient, session = null) {
    const activeSession =
        session ?? (await supabaseClient.auth.getSession()).data.session;
    if (!activeSession) return;

    addOrUpdateAccount(activeSession);
    await syncAccountProfileFromSupabase(supabaseClient, activeSession.user.id);
}
