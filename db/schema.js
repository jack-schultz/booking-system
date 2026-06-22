import { Schema, Table } from '@powersync/web';

// This defines the PowerSync schema

export const AppSchema = new Schema({
    bookings: new Table({
        id: 'TEXT',
        customer_name: 'TEXT',
        booking_date: 'TEXT',
        created_at: 'TEXT'
    }),
});
