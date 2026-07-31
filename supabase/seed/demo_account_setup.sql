-- One-time demo account setup (run in Supabase SQL editor as service role / postgres).
--
-- Prerequisites:
--   1. Run migrations 001–005 (including 005_demo_sandbox.sql).
--   2. Create a demo auth user in Supabase Dashboard → Authentication → Users
--      (email/password must match VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD in .env).
--
-- Default email below; change the variable if your demo user uses a different address.

do $$
declare
  demo_email constant text := 'demo@example.com';
  demo_user_id uuid;
  demo_restaurant_id bigint;
begin
  select id into demo_user_id
  from auth.users
  where email = demo_email
  limit 1;

  if demo_user_id is null then
    raise exception 'Demo auth user not found for email %. Create the user in Supabase Auth first.', demo_email;
  end if;

  select id into demo_restaurant_id
  from public.restaurants
  where is_demo = true
  limit 1;

  if demo_restaurant_id is null then
    raise exception 'Demo restaurant not found. Run migration 005_demo_sandbox.sql first.';
  end if;

  update public.profiles
  set
    restaurant_id = demo_restaurant_id,
    first_name = 'Demo',
    last_name = 'User'
  where id = demo_user_id;

  -- Seed sample bookings (skip if any already exist for demo restaurant).
  if not exists (
    select 1 from public.bookings where restaurant_id = demo_restaurant_id
  ) then
    insert into public.bookings (
      id, restaurant_id, profile_id, datetime,
      first_name, last_name, phone_number, email,
      total_pax, adult_pax, child_pax, hc_pax, preference, status, notes
    ) values
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '18 hours') at time zone 'UTC',
        'Alex', 'Chen', '0400 000 001', 'alex@example.com',
        4, 4, 0, 0, 'indoor', 'set', 'Anniversary dinner'
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '19 hours 30 minutes') at time zone 'UTC',
        'Sam', 'Taylor', '0400 000 002', 'sam@example.com',
        2, 2, 0, 0, 'outdoor', 'pending', null
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '20 hours') at time zone 'UTC',
        'Jordan', 'Lee', '0400 000 003', 'jordan@example.com',
        6, 5, 1, 0, 'indoor', 'pending', 'High chair needed'
      );
  end if;
end;
$$;
