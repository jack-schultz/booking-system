import { migration_001_init } from "./001_bookings.js";
import { migration_002_bookings } from "./002_index.js";

export const migrations = [
    migration_001_init,
    migration_002_bookings
];
