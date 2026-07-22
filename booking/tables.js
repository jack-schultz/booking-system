import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import {
    deleteTableAndClearBookings,
    fetchTablesFromSupabase,
    formatTableDeleteConfirmMessage,
    formatTableLabel,
    getBookingsCountForTable,
    insertTableOnline,
    updateTableOnline,
} from '../db/tables.js';
import {
    initAccountSwitcher,
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../auth/accountSwitcher.js';
import { isOnline } from '../config/connectivity.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
    showSyncIndicator: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});

const tablesNotice = document.getElementById('tables-notice');
const tablesList = document.getElementById('tables-list');
const tableForm = document.getElementById('table-form');
const tableFormHeading = document.getElementById('table-form-heading');
const tableNameInput = document.getElementById('table-name');
const tablePaxMaxInput = document.getElementById('table-pax-max');
const tableSaveBtn = document.getElementById('table-save-btn');
const tableCancelBtn = document.getElementById('table-cancel-btn');

/** @type {import('@powersync/web').SyncStreamSubscription | null} */
let activeWatch = null;
/** @type {number | null} */
let editingTableId = null;
/** @type {{ id: number, name: string, pax_max: number | null }[]} */
let cachedTables = [];
/** Bumps on each explicit refresh; stale async fetches are ignored. */
let tablesDisplayGeneration = 0;

const abortController = new AbortController();
const { signal } = abortController;

const OFFLINE_MUTATION_NOTICE =
    'Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.';
const OFFLINE_EMPTY_NOTICE =
    'No tables synced yet. Connect online once to download tables for offline use.';

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => subscribeTables(),
});

const db = await initDatabase();

function setFormDisabled(disabled) {
    tableForm.querySelectorAll('input, button').forEach((el) => {
        el.disabled = disabled;
    });
}

function resetForm() {
    editingTableId = null;
    tableForm.reset();
    tableFormHeading.textContent = 'Add Table';
    tableSaveBtn.textContent = 'Save Table';
    tableCancelBtn.hidden = true;
}

function showNotice(message) {
    tablesNotice.hidden = false;
    tablesNotice.textContent = message;
}

function hideNotice() {
    tablesNotice.hidden = true;
    tablesNotice.textContent = '';
}

function showUnassignedNotice() {
    showNotice(
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.'
    );
    tablesList.innerHTML = '';
    cachedTables = [];
    setFormDisabled(true);
}

function updateOfflineState() {
    if (!hasAssignedRestaurant()) {
        return;
    }

    const offline = !isOnline();
    setFormDisabled(offline);

    if (offline) {
        showNotice(OFFLINE_MUTATION_NOTICE);
        return;
    }

    hideNotice();
}

function parsePaxMax(value) {
    const trimmed = value.trim();
    if (trimmed === '') {
        return null;
    }
    const parsed = parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

async function refreshTablesFromSupabaseDisplay() {
    if (!hasAssignedRestaurant() || !isOnline()) {
        return;
    }

    const generation = ++tablesDisplayGeneration;
    const restaurantId = getActiveRestaurantId();

    try {
        const remote = await fetchTablesFromSupabase(restaurantId);
        if (generation !== tablesDisplayGeneration) {
            return;
        }
        renderTables(remote);
    } catch {
        if (generation === tablesDisplayGeneration) {
            renderTables(cachedTables);
        }
    }
}

async function renderTablesFromWatch(tables) {
    if (!hasAssignedRestaurant()) {
        renderTables(tables);
        return;
    }

    if (isOnline()) {
        await refreshTablesFromSupabaseDisplay();
        return;
    }

    renderTables(tables);
}

function renderTables(tables) {
    cachedTables = tables;
    const mutationsDisabled = !isOnline();

    if (tables.length === 0) {
        tablesList.innerHTML = '<p class="tables-empty">No tables configured yet.</p>';
        if (!isOnline()) {
            showNotice(OFFLINE_EMPTY_NOTICE);
        } else if (hasAssignedRestaurant()) {
            hideNotice();
        }
        return;
    }

    if (isOnline() && hasAssignedRestaurant()) {
        hideNotice();
    }

    const rows = tables.map((table) => {
        const paxDisplay = table.pax_max == null ? '—' : String(table.pax_max);
        const disabledAttr = mutationsDisabled ? ' disabled' : '';
        return `
            <tr data-id="${table.id}">
                <td>${escapeHtml(formatTableLabel(table))}</td>
                <td>${escapeHtml(paxDisplay)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${table.id}"${disabledAttr}>Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${table.id}"${disabledAttr}>Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tablesList.innerHTML = `
        <table class="tables-list">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Max Pax</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    if (mutationsDisabled && hasAssignedRestaurant()) {
        showNotice(OFFLINE_MUTATION_NOTICE);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function startEdit(table) {
    editingTableId = table.id;
    tableNameInput.value = table.name;
    tablePaxMaxInput.value = table.pax_max == null ? '' : String(table.pax_max);
    tableFormHeading.textContent = 'Edit Table';
    tableSaveBtn.textContent = 'Update Table';
    tableCancelBtn.hidden = false;
    tableNameInput.focus();
}

async function subscribeTables() {
    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    resetForm();

    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    updateOfflineState();

    const restaurantId = getActiveRestaurantId();

    activeWatch = db
        .query({
            sql: `SELECT id, name, pax_max FROM tables
                  WHERE restaurant_id = ?
                  ORDER BY name`,
            parameters: [restaurantId],
        })
        .watch();

    activeWatch.registerListener({
        onData: (tables) => {
            void renderTablesFromWatch(tables);
        },
    });
}

tablesList.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (!hasAssignedRestaurant() || !isOnline()) return;

    const restaurantId = getActiveRestaurantId();
    const editBtn = target.closest('.tables-edit-btn');
    const deleteBtn = target.closest('.tables-delete-btn');

    if (editBtn) {
        const id = parseInt(editBtn.getAttribute('data-id') ?? '', 10);
        const row = cachedTables.find((table) => table.id === id);
        if (row) {
            startEdit(row);
        }
        return;
    }

    if (deleteBtn) {
        const id = parseInt(deleteBtn.getAttribute('data-id') ?? '', 10);
        if (Number.isNaN(id)) return;

        try {
            const bookingCount = await getBookingsCountForTable(db, id, restaurantId);
            const message = formatTableDeleteConfirmMessage(bookingCount);
            if (!window.confirm(message)) {
                return;
            }

            await deleteTableAndClearBookings(db, id, restaurantId);
            if (editingTableId === id) {
                resetForm();
            }
            await refreshTablesFromSupabaseDisplay();
        } catch (err) {
            showNotice(err.message ?? 'Could not delete table.');
        }
    }
}, { signal });

tableCancelBtn.addEventListener('click', () => {
    resetForm();
    updateOfflineState();
}, { signal });

tableForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!hasAssignedRestaurant()) {
        return;
    }

    if (!isOnline()) {
        showNotice(OFFLINE_MUTATION_NOTICE);
        return;
    }

    const restaurantId = getActiveRestaurantId();
    const name = tableNameInput.value.trim();
    const pax_max = parsePaxMax(tablePaxMaxInput.value);

    if (!name) {
        showNotice('Table name is required.');
        return;
    }

    try {
        if (editingTableId != null) {
            await updateTableOnline(editingTableId, { name, pax_max }, restaurantId);
            resetForm();
            await refreshTablesFromSupabaseDisplay();
        } else {
            await insertTableOnline({ restaurant_id: restaurantId, name, pax_max });
            tableForm.reset();
            await refreshTablesFromSupabaseDisplay();
        }
        hideNotice();
        updateOfflineState();
    } catch (err) {
        showNotice(err.message ?? 'Could not save table.');
    }
}, { signal });

window.addEventListener('online', () => {
    updateOfflineState();
    if (cachedTables.length > 0) {
        renderTables(cachedTables);
    }
}, { signal });
window.addEventListener('offline', () => {
    updateOfflineState();
    if (cachedTables.length > 0) {
        renderTables(cachedTables);
    }
}, { signal });

window.addEventListener('beforeunload', () => {
    abortController.abort();
    void activeWatch?.close();
});

await switcherPromise;
await ensureSyncConnected(db);
await subscribeTables();
