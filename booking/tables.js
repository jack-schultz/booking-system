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

/** @type {number | null} */
let editingTableId = null;
/** @type {{ id: number, name: string, pax_max: number | null }[]} */
let cachedTables = [];

const abortController = new AbortController();
const { signal } = abortController;

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => refreshTables(),
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

function updateOfflineAddNotice() {
    if (!hasAssignedRestaurant()) {
        return;
    }
    if (!isOnline()) {
        showNotice('Managing tables requires an internet connection.');
        tableSaveBtn.disabled = true;
        return;
    }
    hideNotice();
    if (hasAssignedRestaurant()) {
        tableSaveBtn.disabled = false;
    }
}

function parsePaxMax(value) {
    const trimmed = value.trim();
    if (trimmed === '') {
        return null;
    }
    const parsed = parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function renderTables(tables) {
    cachedTables = tables;

    if (tables.length === 0) {
        tablesList.innerHTML = '<p class="tables-empty">No tables configured yet.</p>';
        return;
    }

    const rows = tables.map((table) => {
        const paxDisplay = table.pax_max == null ? '—' : String(table.pax_max);
        return `
            <tr data-id="${table.id}">
                <td>${escapeHtml(formatTableLabel(table))}</td>
                <td>${escapeHtml(paxDisplay)}</td>
                <td class="tables-actions">
                    <button type="button" class="tables-edit-btn" data-id="${table.id}">Edit</button>
                    <button type="button" class="tables-delete-btn" data-id="${table.id}">Delete</button>
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
    updateOfflineAddNotice();
    tableNameInput.focus();
}

async function refreshTables() {
    resetForm();

    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    setFormDisabled(false);
    updateOfflineAddNotice();

    const restaurantId = getActiveRestaurantId();

    try {
        const tables = isOnline()
            ? await fetchTablesFromSupabase(restaurantId)
            : [];
        renderTables(tables ?? []);
    } catch (err) {
        showNotice(err.message ?? 'Could not load tables from server.');
        renderTables([]);
    }
}

tablesList.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (!hasAssignedRestaurant()) return;

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
            hideNotice();
            await refreshTables();
        } catch (err) {
            showNotice(err.message ?? 'Could not delete table.');
        }
    }
}, { signal });

tableCancelBtn.addEventListener('click', () => {
    resetForm();
    updateOfflineAddNotice();
}, { signal });

tableForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!hasAssignedRestaurant()) {
        return;
    }

    const restaurantId = getActiveRestaurantId();
    const name = tableNameInput.value.trim();
    const pax_max = parsePaxMax(tablePaxMaxInput.value);

    if (!name) {
        showNotice('Table name is required.');
        return;
    }

    if (!isOnline()) {
        showNotice('Managing tables requires an internet connection.');
        return;
    }

    try {
        if (editingTableId != null) {
            await updateTableOnline(editingTableId, { name, pax_max }, restaurantId);
            resetForm();
        } else {
            await insertTableOnline({ restaurant_id: restaurantId, name, pax_max });
            tableForm.reset();
        }
        hideNotice();
        updateOfflineAddNotice();
        await refreshTables();
    } catch (err) {
        showNotice(err.message ?? 'Could not save table.');
    }
}, { signal });

window.addEventListener('online', () => {
    updateOfflineAddNotice();
    void refreshTables();
}, { signal });
window.addEventListener('offline', updateOfflineAddNotice, { signal });

await switcherPromise;
await refreshTables();
void ensureSyncConnected(db);
