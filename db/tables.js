import { isOnline } from '../config/connectivity.js';

/**
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} restaurantId
 */
export async function getTablesForRestaurant(db, restaurantId) {
    return db.getAll(
        `SELECT id, name, pax_max FROM tables
         WHERE restaurant_id = ?
         ORDER BY name`,
        [restaurantId]
    );
}

/**
 * Fetch tables from Supabase REST (source of truth when PowerSync has not synced tables).
 * @param {number} restaurantId
 * @returns {Promise<{ id: number, name: string, pax_max: number | null }[] | null>}
 */
export async function fetchTablesFromSupabase(restaurantId) {
    if (!isOnline()) {
        return null;
    }

    const { supabase } = await import('../supabaseClient.js');
    const { data, error } = await supabase
        .from('tables')
        .select('id, name, pax_max')
        .eq('restaurant_id', restaurantId)
        .order('name');

    if (error) {
        throw error;
    }

    const rows = data ?? [];

    return rows;
}

/** @param {{ name: string, pax_max: number | null }} table */
export function formatTableLabel(table) {
    if (table.pax_max == null) {
        return table.name;
    }
    return `${table.name} (${table.pax_max} max)`;
}

/** @param {number} bookingCount */
export function formatTableDeleteConfirmMessage(bookingCount) {
    if (bookingCount <= 0) {
        return 'Delete this table?';
    }
    const bookingLabel = bookingCount === 1 ? 'booking' : 'bookings';
    return `This table is assigned to ${bookingCount} ${bookingLabel}. Deleting it will set those bookings to None. Continue?`;
}

/**
 * Insert via Supabase REST (server-assigned bigint id). Requires network.
 * @param {{ restaurant_id: number, name: string, pax_max: number | null }} table
 */
export async function insertTableOnline(table) {
    if (!isOnline()) {
        throw new Error('Adding tables requires an internet connection.');
    }

    const { supabase } = await import('../supabaseClient.js');
    const { error } = await supabase.from('tables').insert({
        restaurant_id: table.restaurant_id,
        name: table.name,
        pax_max: table.pax_max,
    });

    if (error) {
        throw error;
    }
}

/**
 * Update a table via Supabase REST. Avoids PowerSync local-write restrictions on integer PKs.
 * @param {number} id
 * @param {{ name: string, pax_max: number | null }} table
 * @param {number} restaurantId
 */
export async function updateTableOnline(id, table, restaurantId) {
    if (!isOnline()) {
        throw new Error('Updating tables requires an internet connection.');
    }

    const { supabase } = await import('../supabaseClient.js');
    const { error } = await supabase
        .from('tables')
        .update({ name: table.name, pax_max: table.pax_max })
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

    if (error) {
        throw error;
    }
}

/**
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} id
 * @param {{ name: string, pax_max: number | null }} table
 * @param {number} restaurantId
 */
export async function updateTable(db, id, table, restaurantId) {
    await db.execute(
        `UPDATE tables SET name = ?, pax_max = ?
         WHERE id = ? AND restaurant_id = ?`,
        [table.name, table.pax_max, id, restaurantId]
    );
}

/**
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} tableId
 * @param {number} restaurantId
 */
export async function getBookingsCountForTable(db, tableId, restaurantId) {
    const row = await db.get(
        `SELECT COUNT(*) AS count FROM bookings
         WHERE table_id = ? AND restaurant_id = ?`,
        [tableId, restaurantId]
    );
    return row?.count ?? 0;
}

/**
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} tableId
 * @param {number} restaurantId
 */
export async function clearTableFromBookings(db, tableId, restaurantId) {
    await db.execute(
        `UPDATE bookings SET table_id = NULL
         WHERE table_id = ? AND restaurant_id = ?`,
        [tableId, restaurantId]
    );
}

/**
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} id
 * @param {number} restaurantId
 */
export async function deleteTable(db, id, restaurantId) {
    await db.execute(
        `DELETE FROM tables WHERE id = ? AND restaurant_id = ?`,
        [id, restaurantId]
    );
}

/**
 * Clear table_id from assigned bookings, then delete the table via Supabase.
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} id
 * @param {number} restaurantId
 */
export async function deleteTableAndClearBookings(db, id, restaurantId) {
    await clearTableFromBookings(db, id, restaurantId);

    if (!isOnline()) {
        throw new Error('Deleting tables requires an internet connection.');
    }

    const { supabase } = await import('../supabaseClient.js');
    const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

    if (error) {
        throw error;
    }
}

/**
 * Populate a <select> with restaurant tables. Preserves or creates a "None" placeholder.
 * @param {HTMLSelectElement} selectElement
 * @param {{ id: number, name: string, pax_max: number | null }[]} tables
 */
export function populateTableSelect(selectElement, tables) {
    const placeholder = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = '';
    if (placeholder) {
        selectElement.appendChild(placeholder);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.selected = true;
        defaultOption.textContent = 'None';
        selectElement.appendChild(defaultOption);
    }

    for (const table of tables) {
        const option = document.createElement('option');
        option.value = String(table.id);
        option.textContent = formatTableLabel(table);
        selectElement.appendChild(option);
    }
}

/**
 * Load tables for UI: Supabase when online, otherwise local SQLite (PowerSync cache).
 * @param {import('@powersync/web').PowerSyncDatabase} db
 * @param {number} restaurantId
 */
export async function loadTablesForRestaurant(db, restaurantId) {
    const remote = await fetchTablesFromSupabase(restaurantId);
    if (remote != null) {
        return remote;
    }
    return getTablesForRestaurant(db, restaurantId);
}
