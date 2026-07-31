-- Demo sandbox: shared restaurant, booking cap, reset function, and seed tables.
-- Run after 001–004. Demo auth user + profile assignment: see supabase/seed/demo_account_setup.sql

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

alter table public.restaurants
  add column if not exists is_demo boolean not null default false;

-- Staff may read their assigned restaurant (needed for profile join is_demo).
drop policy if exists restaurants_select_own on public.restaurants;
create policy restaurants_select_own
  on public.restaurants for select
  using (
    id = (select restaurant_id from public.profiles where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Demo booking limit (max 5 per demo restaurant)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_demo_booking_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  demo_limit constant int := 5;
  current_count int;
  is_demo_restaurant boolean;
begin
  select r.is_demo into is_demo_restaurant
  from public.restaurants r
  where r.id = new.restaurant_id;

  if not coalesce(is_demo_restaurant, false) then
    return new;
  end if;

  select count(*) into current_count
  from public.bookings
  where restaurant_id = new.restaurant_id;

  if current_count >= demo_limit then
    raise exception 'DEMO_BOOKING_LIMIT: Demo mode allows a maximum of % bookings.', demo_limit
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_enforce_demo_limit on public.bookings;
create trigger bookings_enforce_demo_limit
  before insert on public.bookings
  for each row
  execute function public.enforce_demo_booking_limit();

-- ---------------------------------------------------------------------------
-- Demo table protection (read-only layout for shared sandbox)
-- ---------------------------------------------------------------------------

drop policy if exists tables_insert_own_restaurant on public.tables;
create policy tables_insert_own_restaurant
  on public.tables for insert
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
    and not exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_demo = true
    )
  );

drop policy if exists tables_update_own_restaurant on public.tables;
create policy tables_update_own_restaurant
  on public.tables for update
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
    and not exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_demo = true
    )
  )
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
    and not exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_demo = true
    )
  );

drop policy if exists tables_delete_own_restaurant on public.tables;
create policy tables_delete_own_restaurant
  on public.tables for delete
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
    and not exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_demo = true
    )
  );

-- ---------------------------------------------------------------------------
-- Reset function (service role only)
-- ---------------------------------------------------------------------------

create or replace function public.reset_demo_sandbox()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  demo_restaurant_id bigint;
  demo_profile_id uuid;
begin
  select id into demo_restaurant_id
  from public.restaurants
  where is_demo = true
  limit 1;

  if demo_restaurant_id is null then
    raise exception 'No demo restaurant found (is_demo = true)';
  end if;

  delete from public.bookings
  where restaurant_id = demo_restaurant_id;

  select id into demo_profile_id
  from public.profiles
  where restaurant_id = demo_restaurant_id
  limit 1;

  if demo_profile_id is null then
    return;
  end if;

  insert into public.bookings (
    id, restaurant_id, profile_id, datetime,
    first_name, last_name, phone_number, email,
    total_pax, adult_pax, child_pax, hc_pax, preference, status, notes
  ) values
    (
      gen_random_uuid(), demo_restaurant_id, demo_profile_id,
      (current_date + interval '18 hours') at time zone 'UTC',
      'Alex', 'Chen', '0400 000 001', 'alex@example.com',
      4, 4, 0, 0, 'indoor', 'set', 'Anniversary dinner'
    ),
    (
      gen_random_uuid(), demo_restaurant_id, demo_profile_id,
      (current_date + interval '19 hours 30 minutes') at time zone 'UTC',
      'Sam', 'Taylor', '0400 000 002', 'sam@example.com',
      2, 2, 0, 0, 'outdoor', 'pending', null
    ),
    (
      gen_random_uuid(), demo_restaurant_id, demo_profile_id,
      (current_date + interval '20 hours') at time zone 'UTC',
      'Jordan', 'Lee', '0400 000 003', 'jordan@example.com',
      6, 5, 1, 0, 'indoor', 'pending', 'High chair needed'
    );
end;
$$;

revoke all on function public.reset_demo_sandbox() from public;
grant execute on function public.reset_demo_sandbox() to service_role;

-- ---------------------------------------------------------------------------
-- Seed demo restaurant and tables (idempotent)
-- ---------------------------------------------------------------------------

insert into public.restaurants (name, is_demo)
select 'Demo Restaurant', true
where not exists (
  select 1 from public.restaurants where is_demo = true
);

insert into public.tables (restaurant_id, name, pax_max)
select r.id, t.name, t.pax_max
from public.restaurants r
cross join (
  values
    ('Table 1', 2),
    ('Table 2', 4),
    ('Table 3', 4),
    ('Table 4', 6)
) as t(name, pax_max)
where r.is_demo = true
  and not exists (
    select 1 from public.tables existing
    where existing.restaurant_id = r.id
  );
