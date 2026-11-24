-- ⚔️ Empire of Coins: online casino duels between friends (✊ Rock Paper Scissors, 🎲 Dice Battle).
-- Run AFTER supabase-friends.sql and supabase-profiles-money.sql.
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
--
-- The database is the referee: it keeps each pick secret until both players have chosen, rolls the dice,
-- runs the timers and decides the winner. Players can only read their own duels and can only change them
-- through the functions below (never directly).

create table if not exists public.duels (
  id         bigint generated always as identity primary key,
  game       text not null check (game in ('rps', 'dice')),
  a          uuid not null references public.profiles (user_id) on delete cascade,   -- who challenged
  b          uuid not null references public.profiles (user_id) on delete cascade,   -- who was challenged
  bet        double precision not null check (bet > 0 and bet < 1e300),
  status     text not null default 'invited' check (status in ('invited', 'active', 'done', 'declined', 'cancelled', 'expired')),
  round      int not null default 0,
  score_a    int not null default 0,
  score_b    int not null default 0,
  log        jsonb not null default '[]',      -- finished rounds: [{r, a, b, w}]
  winner     uuid,
  reason     text,                              -- how it ended: 'score', 'left', 'resign'
  deadline   timestamptz,                       -- end of the current pick/roll
  seen_a     timestamptz,
  seen_b     timestamptz,
  settled_a  boolean not null default false,    -- each player collects (or pays) the bet once
  settled_b  boolean not null default false,
  created_at timestamptz not null default now(),
  ended_at   timestamptz,
  check (a <> b)
);
create index if not exists duels_a_idx on public.duels (a, status);
create index if not exists duels_b_idx on public.duels (b, status);

-- the picks of the round being played: nobody can read this table, only the functions below
create table if not exists public.duel_moves (
  duel_id bigint not null references public.duels (id) on delete cascade,
  round   int not null,
  player  uuid not null,
  pick    text not null,
  primary key (duel_id, round, player)
);

alter table public.duels enable row level security;
alter table public.duel_moves enable row level security;
drop policy if exists "see own duels" on public.duels;
create policy "see own duels" on public.duels for select to authenticated using ((select auth.uid()) in (a, b));
revoke all on public.duels from anon, authenticated;
grant select on public.duels to authenticated;
revoke all on public.duel_moves from anon, authenticated;

-- ---------- helpers (not callable by players) ----------
create or replace function public.duel_rand_pick(g text) returns text language sql volatile set search_path = '' as $$
  select case when g = 'rps' then (array['rock', 'paper', 'scissors'])[1 + floor(random() * 3)::int]
              else (1 + floor(random() * 6)::int)::text || ',' || (1 + floor(random() * 6)::int)::text end;
$$;

-- the state of a duel as one player sees it (the opponent's pick of the current round stays hidden)
create or replace function public.duel_view(d public.duels, me uuid) returns jsonb language plpgsql stable set search_path = '' as $$
declare opp uuid := case when me = d.a then d.b else d.a end; p public.profiles; mine text; opp_moved boolean;
begin
  select * into p from public.profiles where user_id = opp;
  select pick into mine from public.duel_moves where duel_id = d.id and round = d.round and player = me;
  opp_moved := exists (select 1 from public.duel_moves where duel_id = d.id and round = d.round and player = opp);
  return jsonb_build_object(
    'id', d.id, 'game', d.game, 'status', d.status, 'bet', d.bet, 'round', d.round, 'log', d.log,
    'me', case when me = d.a then 'a' else 'b' end,
    'my_score', case when me = d.a then d.score_a else d.score_b end,
    'opp_score', case when me = d.a then d.score_b else d.score_a end,
    'opp_id', opp, 'opp_nick', p.nickname, 'opp_avatar', p.avatar,
    'my_pick', mine, 'opp_moved', opp_moved,
    'won', case when d.winner is null then null else d.winner = me end, 'reason', d.reason,
    'settled', case when me = d.a then d.settled_a else d.settled_b end,
    'secs_left', case when d.status = 'invited' then greatest(0, 60 - extract(epoch from now() - d.created_at))
                      when d.deadline is null then null else greatest(0, extract(epoch from d.deadline - now())) end);
end; $$;

-- play the current round if both have picked (or the time is up: missing picks are made at random)
create or replace function public.duel_step(p_id bigint) returns void language plpgsql security definer set search_path = '' as $$
declare d public.duels; pa text; pb text; w text; sa int; sb int;
begin
  select * into d from public.duels where id = p_id;
  if d.status <> 'active' then return; end if;
  select pick into pa from public.duel_moves where duel_id = d.id and round = d.round and player = d.a;
  select pick into pb from public.duel_moves where duel_id = d.id and round = d.round and player = d.b;
  if (pa is null or pb is null) and now() < d.deadline then return; end if;
  if pa is null then pa := public.duel_rand_pick(d.game); insert into public.duel_moves values (d.id, d.round, d.a, pa); end if;
  if pb is null then pb := public.duel_rand_pick(d.game); insert into public.duel_moves values (d.id, d.round, d.b, pb); end if;
  if d.game = 'rps' then
    w := case when pa = pb then null
              when (pa, pb) in (('rock', 'scissors'), ('paper', 'rock'), ('scissors', 'paper')) then 'a' else 'b' end;
  else
    sa := split_part(pa, ',', 1)::int + split_part(pa, ',', 2)::int;
    sb := split_part(pb, ',', 1)::int + split_part(pb, ',', 2)::int;
    w := case when sa = sb then null when sa > sb then 'a' else 'b' end;
  end if;
  update public.duels set
    log = log || jsonb_build_array(jsonb_build_object('r', round, 'a', pa, 'b', pb, 'w', w)),
    score_a = score_a + coalesce((w = 'a')::int, 0), score_b = score_b + coalesce((w = 'b')::int, 0)
  where id = d.id returning * into d;
  if d.score_a >= 2 or d.score_b >= 2 then
    update public.duels set status = 'done', reason = 'score', ended_at = now(), deadline = null,
      winner = case when d.score_a >= 2 then d.a else d.b end where id = d.id;
  else
    update public.duels set round = round + 1, deadline = now() + interval '18 seconds' where id = d.id;   -- 3 s to see the result, 15 s to pick
  end if;
end; $$;
revoke all on function public.duel_step(bigint) from public, anon, authenticated;

-- ---------- what the game calls ----------
-- challenge a friend who is online (both players must have at least the bet, as their profiles show)
create or replace function public.duel_invite(p_opp uuid, p_game text, p_bet double precision) returns bigint
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); new_id bigint;
begin
  if me is null or p_opp is null or me = p_opp then raise exception 'bad_player' using errcode = 'P0001'; end if;
  if p_game not in ('rps', 'dice') then raise exception 'bad_game' using errcode = 'P0001'; end if;
  if p_bet is null or p_bet < 1 or p_bet >= 1e300 then raise exception 'bad_bet' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.friendships f where f.status = 'accepted'
                 and ((f.requester = me and f.addressee = p_opp) or (f.requester = p_opp and f.addressee = me))) then
    raise exception 'not_friends' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.profiles where user_id = p_opp and last_seen > now() - interval '3 minutes') then
    raise exception 'offline' using errcode = 'P0001';
  end if;
  if (select money from public.profiles where user_id = me) < p_bet * 0.98 then raise exception 'no_money' using errcode = 'P0001'; end if;
  if (select money from public.profiles where user_id = p_opp) < p_bet * 0.98 then raise exception 'opp_no_money' using errcode = 'P0001'; end if;
  update public.duels set status = 'expired', ended_at = now() where status = 'invited' and created_at < now() - interval '60 seconds';
  if exists (select 1 from public.duels where status in ('invited', 'active') and (me in (a, b))) then raise exception 'busy' using errcode = 'P0001'; end if;
  if exists (select 1 from public.duels where status in ('invited', 'active') and (p_opp in (a, b))) then raise exception 'opp_busy' using errcode = 'P0001'; end if;
  insert into public.duels (game, a, b, bet, seen_a) values (p_game, me, p_opp, p_bet, now()) returning id into new_id;
  return new_id;
end; $$;

-- accept or decline a challenge you received
create or replace function public.duel_respond(p_id bigint, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or d.b <> me then raise exception 'not_yours' using errcode = 'P0001'; end if;
  if d.status <> 'invited' then raise exception 'gone' using errcode = 'P0001'; end if;
  if d.created_at < now() - interval '60 seconds' then
    update public.duels set status = 'expired', ended_at = now() where id = d.id;
    raise exception 'expired' using errcode = 'P0001';
  end if;
  if not p_accept then
    update public.duels set status = 'declined', ended_at = now() where id = d.id returning * into d;
  else
    if exists (select 1 from public.duels where status = 'active' and me in (a, b)) then raise exception 'busy' using errcode = 'P0001'; end if;
    update public.duels set status = 'active', round = 1, deadline = now() + interval '15 seconds', seen_a = now(), seen_b = now()
      where id = d.id returning * into d;
  end if;
  return public.duel_view(d, me);
end; $$;

-- make your pick ('rock' / 'paper' / 'scissors'), or roll your dice ('roll'); a pick can't be changed
create or replace function public.duel_move(p_id bigint, p_pick text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) then raise exception 'not_yours' using errcode = 'P0001'; end if;
  if d.status = 'active' then
    if d.game = 'rps' and p_pick not in ('rock', 'paper', 'scissors') then raise exception 'bad_pick' using errcode = 'P0001'; end if;
    if d.game = 'dice' then p_pick := public.duel_rand_pick('dice'); end if;
    insert into public.duel_moves values (d.id, d.round, me, p_pick) on conflict do nothing;
    perform public.duel_step(d.id);
  end if;
  select * into d from public.duels where id = p_id;
  return public.duel_view(d, me);
end; $$;

-- called about once a second by both players during a duel: "I'm still here", runs the timers, returns the state
create or replace function public.duel_tick(p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels; other_seen timestamptz;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) then raise exception 'not_yours' using errcode = 'P0001'; end if;
  if me = d.a then update public.duels set seen_a = now() where id = d.id; else update public.duels set seen_b = now() where id = d.id; end if;
  if d.status = 'invited' and d.created_at < now() - interval '60 seconds' then
    update public.duels set status = 'expired', ended_at = now() where id = d.id;
  elsif d.status = 'active' then
    other_seen := case when me = d.a then d.seen_b else d.seen_a end;
    if other_seen < now() - interval '30 seconds' then   -- the other player left: you win
      update public.duels set status = 'done', winner = me, reason = 'left', ended_at = now(), deadline = null where id = d.id;
    else
      perform public.duel_step(d.id);
    end if;
  end if;
  select * into d from public.duels where id = p_id;
  return public.duel_view(d, me);
end; $$;

-- cancel your challenge, or give up a duel (the other player wins)
create or replace function public.duel_cancel(p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) then raise exception 'not_yours' using errcode = 'P0001'; end if;
  if d.status = 'invited' then
    update public.duels set status = case when me = d.a then 'cancelled' else 'declined' end, ended_at = now() where id = d.id;
  elsif d.status = 'active' then
    update public.duels set status = 'done', winner = case when me = d.a then d.b else d.a end, reason = 'resign', ended_at = now(), deadline = null where id = d.id;
  end if;
  select * into d from public.duels where id = p_id;
  return public.duel_view(d, me);
end; $$;

-- collect your result once: returns +bet (you won), -bet (you lost) or null (nothing to collect)
create or replace function public.duel_settle(p_id bigint) returns double precision
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) or d.status <> 'done' then return null; end if;
  if (me = d.a and d.settled_a) or (me = d.b and d.settled_b) then return null; end if;
  if me = d.a then update public.duels set settled_a = true where id = d.id; else update public.duels set settled_b = true where id = d.id; end if;
  return case when d.winner = me then d.bet else -d.bet end;
end; $$;

-- everything that needs your attention: challenges for you, your open challenge, your duel, results to collect
create or replace function public.duel_pending() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  update public.duels set status = 'expired', ended_at = now() where status = 'invited' and created_at < now() - interval '60 seconds' and me in (a, b);
  return coalesce((select jsonb_agg(public.duel_view(d, me) order by d.id) from public.duels d
    where me in (d.a, d.b) and (d.status in ('invited', 'active')
      or (d.status = 'done' and ((me = d.a and not d.settled_a) or (me = d.b and not d.settled_b))))), '[]'::jsonb);
end; $$;

revoke all on function public.duel_invite(uuid, text, double precision), public.duel_respond(bigint, boolean), public.duel_move(bigint, text),
  public.duel_tick(bigint), public.duel_cancel(bigint), public.duel_settle(bigint), public.duel_pending() from public, anon;
grant execute on function public.duel_invite(uuid, text, double precision), public.duel_respond(bigint, boolean), public.duel_move(bigint, text),
  public.duel_tick(bigint), public.duel_cancel(bigint), public.duel_settle(bigint), public.duel_pending() to authenticated;
revoke all on function public.duel_view(public.duels, uuid), public.duel_rand_pick(text) from public, anon, authenticated;
