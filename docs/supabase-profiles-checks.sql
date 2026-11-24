-- 🛡️ Empire of Coins: extra checks on player profiles (run AFTER supabase-profiles.sql).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
-- The game runs in the player's browser, so a cheater could send any numbers straight to the database.
-- These rules make the database itself refuse the impossible ones.

-- when the nickname was last changed (the game charges 100 gcoin; the database allows one change a day)
alter table public.profiles add column if not exists nick_changed_at timestamptz;

-- tighter limits: the game has 4 prestiges and a few hundred achievements
alter table public.profiles drop constraint if exists profiles_nums_ok;
alter table public.profiles add constraint profiles_nums_ok check (
  ach_done between 0 and 1000 and ach_total between 0 and 1000 and ach_done <= ach_total and prestige between 0 and 4);

create or replace function public.profiles_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.nick_changed_at := null;             -- the first nickname is free
    return new;
  end if;
  -- these never change
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  -- nickname: at most one change every 24 hours
  if new.nickname is distinct from old.nickname then
    if old.nick_changed_at is not null and old.nick_changed_at > now() - interval '24 hours' then
      raise exception 'nickname_cooldown' using errcode = 'P0001';
    end if;
    new.nick_changed_at := now();
  else
    new.nick_changed_at := old.nick_changed_at;
  end if;
  -- prestige goes up one step at a time (it may go back to 0 after a game reset)
  if new.prestige > old.prestige + 1 then
    raise exception 'prestige_jump' using errcode = 'P0001';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update on public.profiles for each row execute function public.profiles_guard();
