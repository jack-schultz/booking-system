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

/** @param {{ id: number, name: string, pax_max: number | null }[]} tables */
function formatTableLabel(table) {
    if (table.pax_max == null) {
        return table.name;
    }
    return `${table.name} (${table.pax_max} max)`;
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
