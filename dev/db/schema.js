import { Schema, Table, column } from '@powersync/web';

export const AppSchema = new Schema({
    bookings: new Table(
        {
            id: column.text,
            created_at: column.text,
            restaurant_id: column.integer,
            first_name: column.text,
            last_name: column.text,
            preference: column.text,
            datetime: column.text,
            profile_id: column.text,
            status: column.text,
        },
        {
            indexes: {
                idx_bookings_profile_id: ['profile_id'],
                idx_bookings_datetime: ['datetime'],
            },
        }
    ),

    // Local-only table for tracking SQL migrations (not synced to Supabase).
    migrations: new Table(
        {
            name: column.text,
            applied_at: column.text,
        },
        { localOnly: true }
    ),
});
