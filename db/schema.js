import { Schema, Table, column } from '@powersync/web';

export const AppSchema = new Schema({
    bookings: new Table(
        {
            id: column.text,
            created_at: column.text,
            restaurant_id: column.integer,
            profile_id: column.text,

            datetime: column.text,
            first_name: column.text,
            last_name: column.text,
            phone_number: column.text,
            email: column.text,
            total_pax: column.integer,
            adult_pax: column.integer,
            child_pax: column.integer,
            hc_pax: column.integer,
            preference: column.text,
            status: column.text,
            notes: column.text,
        },
        {
            indexes: {
                idx_bookings_profile_id: ['profile_id'],
                idx_bookings_datetime: ['datetime'],
            },
        }
    ),

    migrations: new Table(
        {
            name: column.text,
            applied_at: column.text,
        },
        { localOnly: true }
    ),
});
