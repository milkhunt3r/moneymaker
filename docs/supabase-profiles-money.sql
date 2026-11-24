-- 💰 Empire of Coins: money and coin skin on player profiles (run AFTER supabase-friends.sql).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
alter table public.profiles add column if not exists money double precision not null default 0;
alter table public.profiles add column if not exists coin text not null default '';
alter table public.profiles drop constraint if exists profiles_money_ok;
alter table public.profiles add constraint profiles_money_ok check (money >= 0 and money < 1e300);
alter table public.profiles drop constraint if exists profiles_coin_ok;
alter table public.profiles add constraint profiles_coin_ok check (coin ~ '^[a-z0-9]{0,20}$');
