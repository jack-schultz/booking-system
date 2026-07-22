import {
    deleteTableAndClearBookings,
    fetchTablesFromSupabase,
    formatTableDeleteConfirmMessage,
    formatTableLabel,
    getBookingsCountForTable,
    insertTableOnline,
    updateTableOnline,
} from '../../db/tables.js';
import {
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';
import { isOnline } from '../../config/connectivity.js';

/** @type {AbortController | null} */
let abortController = null;
/** @type {import('@powersync/web').SyncStreamSubscription | null} */
let activeWatch = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
/** @type {import('@powersync/web').PowerSyncDatabase | null} */
let db = null;

/** @type {number | null} */
let editingTableId = null;
/** @type {{ id: number, name: string, pax_max: number | null }[]} */
let cachedTables = [];
let tablesDisplayGeneration = 0;

const OFFLINE_MUTATION_NOTICE =
    'Table changes require an internet connection. You can still view synced tables and assign them to bookings offline.';
const OFFLINE_EMPTY_NOTICE =
    'No tables synced yet. Connect online once to download tables for offline use.';

const root = () => document.getElementById('view-tables');

function setFormDisabled(disabled) {
    root()?.querySelector('#table-form')?.querySelectorAll('input, button').forEach((el) => {
        el.disabled = disabled;
    });
}

function resetForm() {
    editingTableId = null;
    const tableForm = root()?.querySelector('#table-form');
    const tableFormHeading = root()?.querySelector('#table-form-heading');
    const tableSaveBtn = root()?.querySelector('#table-save-btn');
    const tableCancelBtn = root()?.querySelector('#table-cancel-btn');
    tableForm?.reset();
    if (tableFormHeading) tableFormHeading.textContent = 'Add Table';
    if (tableSaveBtn) tableSaveBtn.textContent = 'Save Table';
    if (tableCancelBtn) tableCancelBtn.hidden = true;
}

function showNotice(message) {
    const tablesNotice = root()?.querySelector('#tables-notice');
    if (!tablesNotice) return;
    tablesNotice.hidden = false;
    tablesNotice.textContent = message;
}

function hideNotice() {
    const tablesNotice = root()?.querySelector('#tables-notice');
    if (!tablesNotice) return;
    tablesNotice.hidden = true;
    tablesNotice.textContent = '';
}

function showUnassignedNotice() {
    showNotice(
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.'
    );
    const tablesList = root()?.querySelector('#tables-list');
    if (tablesList) tablesList.innerHTML = '';
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
    if (!db || !hasAssignedRestaurant() || !isOnline()) {
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderTables(tables) {
    const tablesList = root()?.querySelector('#tables-list');
    if (!tablesList) return;

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

function startEdit(table) {
    editingTableId = table.id;
    const tableNameInput = root()?.querySelector('#table-name');
    const tablePaxMaxInput = root()?.querySelector('#table-pax-max');
    const tableFormHeading = root()?.querySelector('#table-form-heading');
    const tableSaveBtn = root()?.querySelector('#table-save-btn');
    const tableCancelBtn = root()?.querySelector('#table-cancel-btn');

    if (tableNameInput) tableNameInput.value = table.name;
    if (tablePaxMaxInput) tablePaxMaxInput.value = table.pax_max == null ? '' : String(table.pax_max);
    if (tableFormHeading) tableFormHeading.textContent = 'Edit Table';
    if (tableSaveBtn) tableSaveBtn.textContent = 'Update Table';
    if (tableCancelBtn) tableCancelBtn.hidden = false;
    tableNameInput?.focus();
}

async function subscribeTables() {
    if (!db) return;

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

/**
 * @param {{ db: import('@powersync/web').PowerSyncDatabase, registerOnAccountSwitch: Function }} ctx
 */
export async function mountTablesView(ctx) {
    db = ctx.db;
    abortController = new AbortController();
    const { signal } = abortController;

    cachedTables = [];
    tablesDisplayGeneration = 0;

    root()?.querySelector('#tables-list')?.addEventListener('click', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !db) return;

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

    root()?.querySelector('#table-cancel-btn')?.addEventListener('click', () => {
        resetForm();
        updateOfflineState();
    }, { signal });

    root()?.querySelector('#table-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!db || !hasAssignedRestaurant()) {
            return;
        }

        if (!isOnline()) {
            showNotice(OFFLINE_MUTATION_NOTICE);
            return;
        }

        const restaurantId = getActiveRestaurantId();
        const tableNameInput = root()?.querySelector('#table-name');
        const tablePaxMaxInput = root()?.querySelector('#table-pax-max');
        const name = tableNameInput?.value.trim() ?? '';
        const pax_max = parsePaxMax(tablePaxMaxInput?.value ?? '');

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
                root()?.querySelector('#table-form')?.reset();
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

    unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
        void subscribeTables();
    });

    await subscribeTables();
}

export async function unmountTablesView() {
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;

    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    abortController?.abort();
    abortController = null;
    db = null;
    editingTableId = null;
    cachedTables = [];
    tablesDisplayGeneration = 0;
}
