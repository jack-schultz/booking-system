-- Initial schema for multi-restaurant booking sync (Supabase Postgres).
-- Run in Supabase SQL editor or via Supabase CLI.

-- restaurants
create table if not exists public.restaurants (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);

-- profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  restaurant_id bigint references public.restaurants (id),
  created_at timestamptz not null default now()
);

-- bookings (matches db/schema.js)
create table if not exists public.bookings (
  id uuid primary key,
  created_at timestamptz not null default now(),
  restaurant_id bigint not null references public.restaurants (id),
  profile_id uuid references auth.users (id),
  datetime timestamptz not null,
  first_name text not null,
  last_name text,
  phone_number text,
  email text,
  total_pax integer not null,
  adult_pax integer not null,
  child_pax integer not null default 0,
  hc_pax integer not null default 0,
  preference text,
  status text,
  notes text
);

create index if not exists idx_bookings_restaurant_datetime
  on public.bookings (restaurant_id, datetime);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.restaurants enable row level security;

-- profiles: users read/update own row; restaurant_id changes blocked (admin via service role)
create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and restaurant_id is not distinct from (
      select p.restaurant_id from public.profiles p where p.id = auth.uid()
    )
  );

-- bookings: scoped to the user's assigned restaurant
create policy bookings_select_own_restaurant
  on public.bookings for select
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );

create policy bookings_insert_own_restaurant
  on public.bookings for insert
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
    and (select restaurant_id from public.profiles where id = auth.uid()) is not null
  );

create policy bookings_update_own_restaurant
  on public.bookings for update
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  )
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );

create policy bookings_delete_own_restaurant
  on public.bookings for delete
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );
