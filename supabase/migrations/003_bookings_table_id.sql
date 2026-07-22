-- Link bookings to a seating table (nullable; assigned at create/edit time).

alter table public.bookings
  add column if not exists table_id bigint references public.tables (id);

create index if not exists idx_bookings_table_id on public.bookings (table_id);
