import { Schema, Table, column } from '@powersync/web';

/**
 * Domain glossary (also in CONTRIBUTING.md):
 * - total_pax / adult_pax / child_pax: party size breakdown (PAX = guests)
 * - hc_pax: high chair count
 * - datetime / created_at / applied_at: timestamptz stored as ISO 8601 UTC text (…Z)
 * - restaurant_id: tenant scope for SaaS multi-restaurant sync (temporary default in config/constants.js)
 */
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
                idx_bookings_restaurant_id: ['restaurant_id'],
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
