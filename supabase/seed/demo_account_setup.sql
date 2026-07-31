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
  -- 5 today, 3 tomorrow, 2 yesterday (10 total; demo cap is 15).
  if not exists (
    select 1 from public.bookings where restaurant_id = demo_restaurant_id
  ) then
    insert into public.bookings (
      id, restaurant_id, profile_id, datetime,
      first_name, last_name, phone_number, email,
      total_pax, adult_pax, child_pax, hc_pax, preference, status, notes
    ) values
      -- Today (5)
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '9 hours') at time zone 'UTC',
        'Alex', 'Chen', '0400000001', 'alex@example.com',
        4, 4, 0, 0, 'booth', 'set', 'Anniversary dinner'
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '11 hours 30 minutes') at time zone 'UTC',
        'Sam', 'Taylor', '0400000002', 'sam@example.com',
        2, 2, 0, 0, 'none', 'seated', null
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '13 hours') at time zone 'UTC',
        'Jordan', 'Lee', '0400000003', 'jordan@example.com',
        6, 5, 1, 0, 'window', 'pending', 'High chair needed'
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '17 hours') at time zone 'UTC',
        'Riley', 'Nguyen', '0400000004', 'riley@example.com',
        3, 3, 0, 0, 'outdoor', 'set', null
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '19 hours 30 minutes') at time zone 'UTC',
        'Casey', 'Brown', '0400000005', 'casey@example.com',
        2, 2, 0, 0, 'indoor', 'pending', 'Quiet table please'
      ),
      -- Tomorrow (3)
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '1 day 10 hours') at time zone 'UTC',
        'Morgan', 'Patel', '0400000006', 'morgan@example.com',
        4, 4, 0, 0, 'window', 'set', 'Business lunch'
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '1 day 12 hours') at time zone 'UTC',
        'Jamie', 'Wilson', '0400000007', 'jamie@example.com',
        2, 2, 0, 0, 'none', 'pending', null
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date + interval '1 day 20 hours') at time zone 'UTC',
        'Taylor', 'Kim', '0400000008', 'taylor@example.com',
        5, 4, 1, 0, 'booth', 'set', 'Birthday celebration'
      ),
      -- Yesterday (2)
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date - interval '1 day 18 hours') at time zone 'UTC',
        'Quinn', 'Martinez', '0400000009', 'quinn@example.com',
        2, 2, 0, 0, 'indoor', 'seated', null
      ),
      (
        gen_random_uuid(), demo_restaurant_id, demo_user_id,
        (current_date - interval '1 day 20 hours 30 minutes') at time zone 'UTC',
        'Avery', 'Singh', '0400000010', 'avery@example.com',
        3, 2, 1, 0, 'outdoor', 'set', 'Completed visit'
      );
  end if;
end;
$$;

-- Create cron to run function daily
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
   'reset-demo-sandbox',
   '0 17 * * *',  -- minute hour day month weekday (UTC). 17 is 3am adelaide
   $$ select public.reset_demo_sandbox(); $$
);
