-- 👥 Empire of Coins: friends (run AFTER supabase-profiles.sql and supabase-profiles-checks.sql).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.

-- 1) more on each profile: a short friend code, when the player was last online, and which pets they have
create or replace function public.gen_friend_code() returns text language plpgsql volatile set search_path = '' as $$
declare a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text := ''; i int;
begin
  for i in 1..8 loop c := c || substr(a, 1 + floor(random() * length(a))::int, 1); end loop;
  return c;
end; $$;
alter table public.profiles add column if not exists friend_code text;
alter table public.profiles add column if not exists last_seen timestamptz not null default now();
alter table public.profiles add column if not exists pets text[] not null default '{}';
update public.profiles set friend_code = public.gen_friend_code() where friend_code is null;
alter table public.profiles alter column friend_code set default public.gen_friend_code();
alter table public.profiles alter column friend_code set not null;
create unique index if not exists profiles_friend_code_key on public.profiles (friend_code);
alter table public.profiles drop constraint if exists profiles_pets_ok;
alter table public.profiles add constraint profiles_pets_ok check (pets <@ array['mochi', 'pip']::text[]);

-- the guard from supabase-profiles-checks.sql, plus: the friend code never changes, last_seen is always the server's clock
create or replace function public.profiles_guard() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.nick_changed_at := null;
    new.last_seen := now();
    new.friend_code := public.gen_friend_code();
    return new;
  end if;
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  new.friend_code := old.friend_code;
  new.last_seen := now();                    -- any update (the game sends one every minute while you play) = online now
  if new.nickname is distinct from old.nickname then
    if old.nick_changed_at is not null and old.nick_changed_at > now() - interval '24 hours' then
      raise exception 'nickname_cooldown' using errcode = 'P0001';
    end if;
    new.nick_changed_at := now();
  else
    new.nick_changed_at := old.nick_changed_at;
  end if;
  if new.prestige > old.prestige + 1 then
    raise exception 'prestige_jump' using errcode = 'P0001';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before insert or update on public.profiles for each row execute function public.profiles_guard();

-- 2) friendships: one row per pair. status 'pending' (a request) or 'accepted' (friends)
create table if not exists public.friendships (
  id         bigint generated always as identity primary key,
  requester  uuid not null references public.profiles (user_id) on delete cascade,
  addressee  uuid not null references public.profiles (user_id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair_key on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_addressee_idx on public.friendships (addressee);

-- limits, and nobody can change who a request is from or to
create or replace function public.friendships_guard() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.created_at := now();
    if (select count(*) from public.friendships f where f.requester = new.requester and f.status = 'pending') >= 50 then
      raise exception 'too_many_requests' using errcode = 'P0001';
    end if;
    if (select count(*) from public.friendships f where (f.requester = new.requester or f.addressee = new.requester) and f.status = 'accepted') >= 200 then
      raise exception 'too_many_friends' using errcode = 'P0001';
    end if;
    return new;
  end if;
  new.requester := old.requester;
  new.addressee := old.addressee;
  new.created_at := old.created_at;
  return new;
end; $$;
drop trigger if exists friendships_guard on public.friendships;
create trigger friendships_guard before insert or update on public.friendships for each row execute function public.friendships_guard();

alter table public.friendships enable row level security;
drop policy if exists "see own friendships" on public.friendships;
drop policy if exists "send a request" on public.friendships;
drop policy if exists "accept a request" on public.friendships;
drop policy if exists "remove a friendship" on public.friendships;
-- you see only rows you are part of
create policy "see own friendships" on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester, addressee));
-- you can only send requests from yourself
create policy "send a request" on public.friendships for insert to authenticated
  with check ((select auth.uid()) = requester);
-- only the person who received a request can accept it
create policy "accept a request" on public.friendships for update to authenticated
  using ((select auth.uid()) = addressee) with check ((select auth.uid()) = addressee and status = 'accepted');
-- either side can decline, cancel or remove
create policy "remove a friendship" on public.friendships for delete to authenticated
  using ((select auth.uid()) in (requester, addressee));
revoke all on public.friendships from anon;
grant select, insert, update, delete on public.friendships to authenticated;
