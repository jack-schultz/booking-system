export const migration_002_bookings = {
    name: "002_bookings",

    async up(db) {
        await db.execute(`
            CREATE TABLE bookings (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                status TEXT DEFAULT 'pending'
            );
        `);

        await db.execute(`
            CREATE INDEX idx_bookings_user_id
            ON bookings(user_id);
        `);
    }
};