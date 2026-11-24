-- 👤 Empire of Coins: player profiles (nickname, avatar, achievements, prestige count).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run" (once). It is safe to run again.
-- Every signed-in player can SEE every profile (that's the point: other players see you),
-- but each player can only create, change or delete their OWN profile.

create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,   -- "Delete account" removes the profile too
  nickname   text not null,
  avatar     text not null default '',      -- an achievement badge id, e.g. "cash1s"
  ach_done   int  not null default 0,       -- achievements unlocked
  ach_total  int  not null default 0,       -- achievements in the game for this player
  prestige   int  not null default 0,       -- prestige count
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- one nickname per player, ignoring upper/lower case ("Bob" and "bob" are the same name)
create unique index if not exists profiles_nickname_key on public.profiles (lower(nickname));

-- sane values only
alter table public.profiles drop constraint if exists profiles_nick_ok;
alter table public.profiles add constraint profiles_nick_ok check (
  char_length(nickname) between 3 and 16
  and nickname ~ '^[A-Za-z0-9ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ_ .-]+$'
  and nickname = btrim(nickname) and nickname !~ '  ');
alter table public.profiles drop constraint if exists profiles_avatar_ok;
alter table public.profiles add constraint profiles_avatar_ok check (avatar ~ '^[A-Za-z0-9-]{0,40}$');
alter table public.profiles drop constraint if exists profiles_nums_ok;
alter table public.profiles add constraint profiles_nums_ok check (
  ach_done between 0 and 2000 and ach_total between 0 and 2000 and ach_done <= ach_total and prestige between 0 and 100);

-- 🚫 rude or reserved nicknames are refused by the database too (the game checks the same lists first)
create or replace function public.nickname_is_ok(n text) returns boolean language plpgsql immutable set search_path = '' as $$
declare
  t text; joined text; squeezed text; words text[];
begin
  t := lower(n);
  t := translate(t, 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ', 'aaaaaaceeeeiiiinooooouuuuyy');
  t := translate(t, '013457@$!', 'oieastasi');
  joined := regexp_replace(t, '[^a-z]', '', 'g');
  squeezed := regexp_replace(joined, '([a-z])\1+', '\1', 'g');          -- "fuuuck" → "fuck"
  words := regexp_split_to_array(regexp_replace(t, '[^a-z]+', ' ', 'g'), ' ');
  -- bad anywhere in the name
  if joined ~ '(fuck|fck|shit|bitch|bich|cunt|nigg|niga|faggot|fagot|whore|slut|rapist|nazi|hitler|porn|pussy|pusy|penis|vagina|asshole|ashole|retard|wanker|dildo|jizz|molest|incest|hijoput|hijodeput|hijaput|gilipol|mierd|cabron|pendej|maricon|folla|subnormal|putita|puton)'
     or squeezed ~ '(fuck|fck|shit|bitch|bich|cunt|nigg|niga|fagot|whore|slut|rapist|nazi|hitler|porn|pusy|penis|vagina|ashole|retard|wanker|dildo|jiz|molest|incest|hijoput|hijodeput|hijaput|gilipol|mierd|cabron|pendej|maricon|fola|subnormal|putita|puton)' then
    return false;
  end if;
  -- bad as a whole word (they hide inside normal words like "class" or "calculo")
  if exists (select 1 from unnest(words) w where w in ('ass','fag','dick','cock','cum','sex','sexy','pedo','anal','boob','boobs','tits','tit','rape','puta','puto','putas','putos','culo','polla','verga','zorra','cono','pene','perra','joder','hdp','mamon','admin','moderator','mod','official','oficial','staff','support','soporte','system','sistema'))
     or joined in ('admin','moderator','empireofcoins','official','staff','support','kkk') then
    return false;
  end if;
  return true;
end; $$;
alter table public.profiles drop constraint if exists profiles_nick_clean;
alter table public.profiles add constraint profiles_nick_clean check (public.nickname_is_ok(nickname));

-- Row Level Security
alter table public.profiles enable row level security;
drop policy if exists "anyone signed in can read profiles" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
drop policy if exists "delete own profile" on public.profiles;
create policy "anyone signed in can read profiles" on public.profiles for select to authenticated using (true);
create policy "insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;

-- keep updated_at current
create or replace function public.profiles_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.profiles_touch();
