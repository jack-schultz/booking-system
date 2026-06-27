// PowerSync creates the bookings table/view from AppSchema on db.init().
// Keep this migration for any one-time data backfills or raw SQL that cannot
// be expressed in the PowerSync schema.
export const migration_001_init = {
    name: '001_bookings',

    async up(_db) {
        // no-op: schema is managed by PowerSync
    },
};
