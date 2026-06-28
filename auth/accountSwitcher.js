import { supabase } from "../supabaseClient.js";
import {
    addOrUpdateAccount,
    getAccountDisplayName,
    getAccounts,
    getActiveAccount,
    migrateExistingSession,
    removeActiveAccount,
    setActiveAccount,
} from "./accounts.js";
import { syncAccountProfileFromSupabase } from "./profiles.js";

let dropdownRender = null;

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
            btn.addEventListener("click", async () => {
                await setActiveAccount(account.id, supabase);
                await syncAccountProfileFromSupabase(supabase, account.id);
                render();
                dropdown.hidden = true;
                onSwitch?.(getActiveAccount());
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

export function getActiveProfileId() {
    return getActiveAccount()?.id ?? null;
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

    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && (event === "TOKEN_REFRESHED" || event === "SIGNED_IN")) {
            addOrUpdateAccount(session);
            await syncAccountProfileFromSupabase(supabase, session.user.id);
            dropdownRender?.();
        }
    });

    await migrateExistingSession(supabase);

    const active = getActiveAccount();
    if (active) {
        await syncAccountProfileFromSupabase(supabase, active.id);
    }
    dropdownRender?.();

    if (requireAuth && !active) {
        window.location.href = loginRedirect;
        return null;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const remaining = await removeActiveAccount(supabase);
            if (!remaining) {
                window.location.href = loginRedirect;
                return;
            }
            dropdownRender?.();
        });
    }

    return getActiveAccount();
}

export async function registerLoggedInSession(supabaseClient) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    addOrUpdateAccount(session);
    await syncAccountProfileFromSupabase(supabaseClient, session.user.id);
}
