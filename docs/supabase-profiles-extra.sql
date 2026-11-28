-- 🏅 Empire of Coins: levels, achievement showcase and "hide my money" on player profiles
-- (run AFTER supabase-profiles-money.sql).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
-- The game works without it (these parts just stay hidden until it has been run).

-- 🦊🦉🦅 Gambler / Investor / Logistics levels, e.g. {"g": 42, "i": 50, "l": 31}
alter table public.profiles add column if not exists levels jsonb not null default '{}'::jsonb;
alter table public.profiles drop constraint if exists profiles_levels_ok;
alter table public.profiles add constraint profiles_levels_ok check (jsonb_typeof(levels) = 'object' and length(levels::text) < 80);

-- 🏅 up to 3 achievement ids the player shows off
alter table public.profiles add column if not exists showcase text[] not null default '{}';
alter table public.profiles drop constraint if exists profiles_showcase_ok;
alter table public.profiles add constraint profiles_showcase_ok check (
  cardinality(showcase) <= 3 and array_to_string(showcase, ',') ~ '^[A-Za-z0-9_,]{0,150}$');

-- 🙈 hide my money from other players (the game hides it; the duel referee still uses the money column)
alter table public.profiles add column if not exists hide_money boolean not null default false;

-- 🐾 pets: allow 🤖 Digy (and future pets: short lowercase names, at most 8)
alter table public.profiles drop constraint if exists profiles_pets_ok;
alter table public.profiles add constraint profiles_pets_ok check (cardinality(pets) <= 8 and array_to_string(pets, ',') ~ '^[a-z,]{0,100}$');
