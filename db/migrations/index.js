import { migration_001_init } from "./001_init.js";
import { migration_002_bookings } from "./002_bookings.js";

export const migrations = [
    migration_001_init,
    migration_002_bookings
];
