function isTimestamptz(value) {
    return /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function legacyDatetimeToTimestamptz(value) {
    if (!value || isTimestamptz(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString();
}

export const migration_001 = {
    name: '001',

    async up(db) {
        const rows = await db.getAll(`SELECT id, datetime, created_at FROM bookings`);
        for (const row of rows) {
            const datetime = legacyDatetimeToTimestamptz(row.datetime);
            const created_at = legacyDatetimeToTimestamptz(row.created_at);
            if (datetime !== row.datetime || created_at !== row.created_at) {
                await db.execute(
                    `UPDATE bookings SET datetime = ?, created_at = ? WHERE id = ?`,
                    [datetime, created_at, row.id]
                );
            }
        }
    },
};
