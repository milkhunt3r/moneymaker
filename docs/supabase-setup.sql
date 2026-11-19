-- ☁️ Empire of Coins: cloud save table for Supabase.
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run" (once).

-- 1) One row per player: the whole save as JSON
create table if not exists public.saves (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb  not null,
  saved_at   bigint not null,                 -- set by the game (milliseconds); used so two devices never overwrite each other by accident
  updated_at timestamptz not null default now()
);

-- 2) Row Level Security: each player can only see and change their own row
alter table public.saves enable row level security;

drop policy if exists "read own save"   on public.saves;
drop policy if exists "insert own save" on public.saves;
drop policy if exists "update own save" on public.saves;
drop policy if exists "delete own save" on public.saves;
create policy "read own save"   on public.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own save" on public.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own save" on public.saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own save" on public.saves for delete to authenticated using ((select auth.uid()) = user_id);

-- only logged-in players can reach the table (nothing for anonymous visitors)
revoke all on public.saves from anon;
grant select, insert, update, delete on public.saves to authenticated;

-- keep updated_at current on every change
create or replace function public.saves_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
drop trigger if exists saves_touch on public.saves;
create trigger saves_touch before update on public.saves for each row execute function public.saves_touch();

-- 3) "Delete my account": removes the player's login and (through "on delete cascade") their save
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 4) Hardening (run once more if you already ran the parts above):
--    a save may be at most 2 MB, so nobody can fill the database with huge rows
alter table public.saves drop constraint if exists saves_size;
alter table public.saves add constraint saves_size check (pg_column_size(data) < 2000000);
