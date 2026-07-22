-- Allow staff to manage tables for their assigned restaurant (admin page).

drop policy if exists tables_insert_own_restaurant on public.tables;
create policy tables_insert_own_restaurant
  on public.tables for insert
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );

drop policy if exists tables_update_own_restaurant on public.tables;
create policy tables_update_own_restaurant
  on public.tables for update
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  )
  with check (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );

drop policy if exists tables_delete_own_restaurant on public.tables;
create policy tables_delete_own_restaurant
  on public.tables for delete
  using (
    restaurant_id = (select restaurant_id from public.profiles where id = auth.uid())
  );
