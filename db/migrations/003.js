export const migration_003 = {
    name: '003',

    async up(db) {
        const columns = await db.getAll(`PRAGMA table_info(bookings)`);
        const hasTableId = columns.some((column) => column.name === 'table_id');

        if (!hasTableId) {
            // Nullable int8 FK to public.tables.id (restaurant seating table assignment).
            await db.execute(`ALTER TABLE bookings ADD COLUMN table_id INTEGER`);
        }
    },
};
