-- ⚔️ Empire of Coins: online casino duels between friends (✊ Rock Paper Scissors, 🎲 Dice Battle (2–5 dice, a 1 scores 0, best of 3 or 5), 💰 Bluff Chest (hide with an optional sparkle, then guess; both hide equally often), 🏁 Race to 42).
-- Run AFTER supabase-friends.sql and supabase-profiles-money.sql.
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
--
-- The database is the referee: it keeps each pick secret until both players have chosen, rolls the dice,
-- runs the timers and decides the winner. Players can only read their own duels and can only change them
-- through the functions below (never directly).

create table if not exists public.duels (
  id         bigint generated always as identity primary key,
  game       text not null,
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
-- (added later, kept safe to run again on an existing table)
alter table public.duels add column if not exists st jsonb not null default '{}';   -- 🏁 Race to 21: {"turn": "a"/"b", "tp": points this turn}
alter table public.duels drop constraint if exists duels_game_check;
alter table public.duels add constraint duels_game_check check (game in ('rps', 'dice', 'chest', 'race'));
alter table public.duels add column if not exists goal int not null default 42;   -- 🏁 Race: first to 42 (races from before had 21)
alter table public.duels alter column goal set default 42;
alter table public.duels drop constraint if exists duels_goal_check;
alter table public.duels add constraint duels_goal_check check (goal in (21, 42));
alter table public.duels add column if not exists best int not null default 3;   -- 🎲 Dice Battle: best of 3 or best of 5
alter table public.duels drop constraint if exists duels_best_check;
alter table public.duels add constraint duels_best_check check (best in (3, 5));
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
              when g = 'chest' then (1 + floor(random() * 3)::int)::text
              else (1 + floor(random() * 6)::int)::text || ',' || (1 + floor(random() * 6)::int)::text end;
$$;

-- 🎲 Dice Battle: roll n dice ("4,2,6"); a roll with any 1 scores 0, otherwise the total
create or replace function public.duel_dice_roll(n int) returns text language sql volatile set search_path = '' as $$
  select string_agg((1 + floor(random() * 6)::int)::text, ',') from generate_series(1, greatest(2, least(5, n)));
$$;
create or replace function public.duel_dice_score(p text) returns int language sql immutable set search_path = '' as $$
  select case when '1' = any(string_to_array(p, ',')) then 0 else (select coalesce(sum(x::int), 0)::int from unnest(string_to_array(p, ',')) x) end;
$$;

-- 💰 Bluff Chest: decided once someone has 3+ points and is ahead (checked when both have hidden the same number of times)
create or replace function public.duel_chest_win(x int, y int) returns text language sql immutable set search_path = '' as $$
  select case when greatest(x, y) >= 3 and x <> y then (case when x > y then 'a' else 'b' end) end;
$$;

-- the state of a duel as one player sees it (the opponent's pick of the current round stays hidden)
create or replace function public.duel_view(d public.duels, me uuid) returns jsonb language plpgsql stable set search_path = '' as $$
declare opp uuid := case when me = d.a then d.b else d.a end; p public.profiles; mine text; opp_moved boolean;
begin
  select * into p from public.profiles where user_id = opp;
  select pick into mine from public.duel_moves where duel_id = d.id and round = d.round and player = me;
  opp_moved := exists (select 1 from public.duel_moves where duel_id = d.id and round = d.round and player = opp);
  return jsonb_build_object(
    'id', d.id, 'game', d.game, 'status', d.status, 'bet', d.bet, 'round', d.round, 'log', d.log, 'st', d.st, 'goal', d.goal, 'best', d.best,
    'hint', case when d.game = 'chest' and d.status = 'active' and ((d.round % 2 = 1) = (opp = d.a))   -- 💰 the hider's sparkle (never the coin)
      then (select split_part(m.pick, ',', 2) from public.duel_moves m where m.duel_id = d.id and m.round = d.round and m.player = opp) end,
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

-- 🏁 Race to 42: one action of the player whose turn it is ('roll' or 'bank'). Totals live in score_a / score_b.
create or replace function public.duel_race(p_id bigint, who text, act text) returns void language plpgsql security definer set search_path = '' as $$
declare d public.duels; tp int; r int; total int; other text;
begin
  select * into d from public.duels where id = p_id;
  if d.status <> 'active' or d.game <> 'race' or d.st->>'turn' <> who then return; end if;
  tp := coalesce((d.st->>'tp')::int, 0);
  other := case when who = 'a' then 'b' else 'a' end;
  total := case when who = 'a' then d.score_a else d.score_b end;
  if act = 'roll' then
    r := 1 + floor(random() * 6)::int;
    if r = 1 then   -- 💥 bust: this turn's points are lost, the other player goes
      update public.duels set log = log || jsonb_build_array(jsonb_build_object('who', who, 'roll', 1, 'bust', true, 'lost', tp)),
        st = jsonb_build_object('turn', other, 'tp', 0), round = round + 1, deadline = now() + interval '17 seconds' where id = d.id;
    elsif total + tp + r >= d.goal then   -- 🏁 reached the goal (21 or 42): banked and won
      update public.duels set log = log || jsonb_build_array(jsonb_build_object('who', who, 'roll', r, 'win', true)),
        score_a = score_a + case when who = 'a' then tp + r else 0 end, score_b = score_b + case when who = 'b' then tp + r else 0 end,
        st = jsonb_build_object('turn', who, 'tp', 0), status = 'done', reason = 'score', ended_at = now(), deadline = null,
        winner = case when who = 'a' then d.a else d.b end where id = d.id;
    else
      update public.duels set log = log || jsonb_build_array(jsonb_build_object('who', who, 'roll', r)),
        st = jsonb_build_object('turn', who, 'tp', tp + r), deadline = now() + interval '15 seconds' where id = d.id;
    end if;
  elsif act = 'bank' then   -- 💰 keep this turn's points, the other player goes
    update public.duels set log = log || jsonb_build_array(jsonb_build_object('who', who, 'bank', tp)),
      score_a = score_a + case when who = 'a' then tp else 0 end, score_b = score_b + case when who = 'b' then tp else 0 end,
      st = jsonb_build_object('turn', other, 'tp', 0), round = round + 1, deadline = now() + interval '17 seconds' where id = d.id;
  end if;
end; $$;
revoke all on function public.duel_race(bigint, text, text) from public, anon, authenticated;

-- play the current round if both have picked (or the time is up: missing picks are made at random)
create or replace function public.duel_step(p_id bigint) returns void language plpgsql security definer set search_path = '' as $$
declare d public.duels; pa text; pb text; w text; sa int; sb int; need int; hider uuid; guesser uuid; ph text; pg text; o1 text; o2 text;
begin
  select * into d from public.duels where id = p_id;
  if d.status <> 'active' then return; end if;
  if d.game = 'race' then   -- 🏁 time's up: the player whose turn it is banks what they have
    if now() >= d.deadline then perform public.duel_race(p_id, d.st->>'turn', 'bank'); end if;
    return;
  end if;
  if d.game = 'chest' then   -- 💰 first the hider hides the coin (+ an optional sparkle "coin,hint"), then the guesser guesses
    hider := case when d.round % 2 = 1 then d.a else d.b end; guesser := case when hider = d.a then d.b else d.a end;
    select pick into ph from public.duel_moves where duel_id = d.id and round = d.round and player = hider;
    select pick into pg from public.duel_moves where duel_id = d.id and round = d.round and player = guesser;
    if ph is null then
      if now() < d.deadline then return; end if;
      ph := (1 + floor(random() * 3)::int)::text || ',0';   -- time's up: hidden at random, no sparkle; the guesser gets a full 15 s
      insert into public.duel_moves values (d.id, d.round, hider, ph);
      update public.duels set deadline = now() + interval '15 seconds' where id = d.id;
      return;
    end if;
    if pg is null then
      if now() < d.deadline then return; end if;
      pg := (1 + floor(random() * 3)::int)::text; insert into public.duel_moves values (d.id, d.round, guesser, pg);
    end if;
    pa := case when hider = d.a then ph else pg end; pb := case when hider = d.b then ph else pg end;
    w := case when split_part(ph, ',', 1) = pg then (case when guesser = d.a then 'a' else 'b' end) else (case when hider = d.a then 'a' else 'b' end) end;
  else
  select pick into pa from public.duel_moves where duel_id = d.id and round = d.round and player = d.a;
  select pick into pb from public.duel_moves where duel_id = d.id and round = d.round and player = d.b;
  if (pa is null or pb is null) and now() < d.deadline then return; end if;
  if pa is null then pa := public.duel_rand_pick(d.game); insert into public.duel_moves values (d.id, d.round, d.a, pa); end if;
  if pb is null then pb := public.duel_rand_pick(d.game); insert into public.duel_moves values (d.id, d.round, d.b, pb); end if;
  end if;
  if d.game = 'rps' then
    w := case when pa = pb then null
              when (pa, pb) in (('rock', 'scissors'), ('paper', 'rock'), ('scissors', 'paper')) then 'a' else 'b' end;
  elsif d.game = 'dice' then
    sa := public.duel_dice_score(pa);   -- any 1 scores 0
    sb := public.duel_dice_score(pb);
    w := case when sa = sb then null when sa > sb then 'a' else 'b' end;
  end if;
  update public.duels set
    log = log || jsonb_build_array(jsonb_build_object('r', round, 'a', pa, 'b', pb, 'w', w)),
    score_a = score_a + coalesce((w = 'a')::int, 0), score_b = score_b + coalesce((w = 'b')::int, 0)
  where id = d.id returning * into d;
  need := case when d.game = 'dice' and d.best = 5 then 3 else 2 end;   -- best of 3: 2 wins, best of 5: 3 wins
  if d.game = 'chest' then
    -- 💰 penalty-shootout rule: odd rounds a hides, even rounds b hides; both always hide the same number of times.
    -- The duel ends when someone has 3+ points and is ahead after a pair of rounds, or earlier when the last round of the pair can't change it.
    if d.round % 2 = 0 then o1 := public.duel_chest_win(d.score_a, d.score_b); o2 := o1;
    else o1 := public.duel_chest_win(d.score_a + 1, d.score_b); o2 := public.duel_chest_win(d.score_a, d.score_b + 1); end if;
    if o1 is not null and o1 = o2 then
      update public.duels set status = 'done', reason = 'score', ended_at = now(), deadline = null,
        winner = case when o1 = 'a' then d.a else d.b end where id = d.id;
    else
      update public.duels set round = round + 1, deadline = now() + interval '18 seconds' where id = d.id;
    end if;
  elsif d.score_a >= need or d.score_b >= need then
    update public.duels set status = 'done', reason = 'score', ended_at = now(), deadline = null,
      winner = case when d.score_a > d.score_b then d.a else d.b end where id = d.id;
  else
    update public.duels set round = round + 1, deadline = now() + interval '18 seconds' where id = d.id;   -- 3 s to see the result, 15 s to pick
  end if;
end; $$;
revoke all on function public.duel_step(bigint) from public, anon, authenticated;

-- ---------- what the game calls ----------
-- challenge a friend who is online (both players must have at least the bet, as their profiles show)
-- p_goal: kept for game versions that send it; every new race goes to 42 · p_best: 🎲 Dice Battle, best of 3 or 5
drop function if exists public.duel_invite(uuid, text, double precision);
drop function if exists public.duel_invite(uuid, text, double precision, int);
create or replace function public.duel_invite(p_opp uuid, p_game text, p_bet double precision, p_goal int default 42, p_best int default 3) returns bigint
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); new_id bigint;
begin
  if me is null or p_opp is null or me = p_opp then raise exception 'bad_player' using errcode = 'P0001'; end if;
  if p_game not in ('rps', 'dice', 'chest', 'race') then raise exception 'bad_game' using errcode = 'P0001'; end if;
  if p_bet is null or p_bet < 1 or p_bet >= 1e300 then raise exception 'bad_bet' using errcode = 'P0001'; end if;
  p_goal := 42;   -- 🏁 every race goes to 42 (other games don't use it)
  if p_game <> 'dice' or p_best is null or p_best not in (3, 5) then p_best := 3; end if;
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
  insert into public.duels (game, a, b, bet, seen_a, goal, best) values (p_game, me, p_opp, p_bet, now(), p_goal, p_best) returning id into new_id;
  return new_id;
end; $$;

-- accept or decline a challenge you received
create or replace function public.duel_respond(p_id bigint, p_accept boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels; first text := case when random() < 0.5 then 'a' else 'b' end;
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
    update public.duels set status = 'active', round = 1, deadline = now() + interval '15 seconds', seen_a = now(), seen_b = now(),
      st = case when d.game = 'race' then jsonb_build_object('turn', first, 'tp', 0) else '{}'::jsonb end,
      -- 🏁 Race: the second to roll starts with 4 points (going first wins about 55% of races to 42 otherwise; with 4 it's about 50/50)
      score_a = case when d.game = 'race' and first = 'b' then 4 else 0 end,
      score_b = case when d.game = 'race' and first = 'a' then 4 else 0 end,
      log = case when d.game = 'race' then jsonb_build_array(jsonb_build_object('who', case when first = 'a' then 'b' else 'a' end, 'start', 4)) else '[]'::jsonb end
      where id = d.id returning * into d;
  end if;
  return public.duel_view(d, me);
end; $$;

-- make your pick ('rock' / 'paper' / 'scissors'), roll your dice ('2'–'5': how many dice; anything else: 2), or 'roll' / 'bank' in a race; a pick can't be changed
create or replace function public.duel_move(p_id bigint, p_pick text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels; hider uuid;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) then raise exception 'not_yours' using errcode = 'P0001'; end if;
  if d.status = 'active' then
    if d.game = 'chest' then   -- 💰 the hider sends "coin,hint" (hint 0 = no sparkle), the guesser a chest once the coin is hidden
      hider := case when d.round % 2 = 1 then d.a else d.b end;
      if me = hider then
        if p_pick ~ '^[123]$' then p_pick := p_pick || ',0'; end if;   -- (older game versions: no sparkle)
        if p_pick !~ '^[123],[0123]$' then raise exception 'bad_pick' using errcode = 'P0001'; end if;
        insert into public.duel_moves values (d.id, d.round, me, p_pick) on conflict do nothing;
        if found then update public.duels set deadline = now() + interval '15 seconds' where id = d.id; end if;   -- the guesser gets a full 15 s
      else
        if p_pick not in ('1', '2', '3') then raise exception 'bad_pick' using errcode = 'P0001'; end if;
        if not exists (select 1 from public.duel_moves where duel_id = d.id and round = d.round and player = hider) then raise exception 'not_yet' using errcode = 'P0001'; end if;
        insert into public.duel_moves values (d.id, d.round, me, p_pick) on conflict do nothing;
      end if;
      perform public.duel_step(d.id);
    elsif d.game = 'race' then
      if p_pick not in ('roll', 'bank') then raise exception 'bad_pick' using errcode = 'P0001'; end if;
      perform public.duel_race(d.id, case when me = d.a then 'a' else 'b' end, p_pick);   -- ignored when it isn't your turn
    else
      if d.game = 'rps' and p_pick not in ('rock', 'paper', 'scissors') then raise exception 'bad_pick' using errcode = 'P0001'; end if;
      if d.game = 'dice' then p_pick := public.duel_dice_roll(case when p_pick in ('2', '3', '4', '5') then p_pick::int else 2 end); end if;
      insert into public.duel_moves values (d.id, d.round, me, p_pick) on conflict do nothing;
      perform public.duel_step(d.id);
    end if;
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

-- collect your result once: returns +0.96 × bet (you won: both bets minus a 2% fee = 1.96 × bet back, of which 1 bet was yours),
-- -bet (you lost) or null (nothing to collect)
create or replace function public.duel_settle(p_id bigint) returns double precision
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); d public.duels;
begin
  select * into d from public.duels where id = p_id for update;
  if d.id is null or me not in (d.a, d.b) or d.status <> 'done' then return null; end if;
  if (me = d.a and d.settled_a) or (me = d.b and d.settled_b) then return null; end if;
  if me = d.a then update public.duels set settled_a = true where id = d.id; else update public.duels set settled_b = true where id = d.id; end if;
  return case when d.winner = me then floor(d.bet * 0.96) else -d.bet end;
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

revoke all on function public.duel_invite(uuid, text, double precision, int, int), public.duel_respond(bigint, boolean), public.duel_move(bigint, text),
  public.duel_tick(bigint), public.duel_cancel(bigint), public.duel_settle(bigint), public.duel_pending() from public, anon;
grant execute on function public.duel_invite(uuid, text, double precision, int, int), public.duel_respond(bigint, boolean), public.duel_move(bigint, text),
  public.duel_tick(bigint), public.duel_cancel(bigint), public.duel_settle(bigint), public.duel_pending() to authenticated;
revoke all on function public.duel_view(public.duels, uuid), public.duel_rand_pick(text), public.duel_dice_roll(int), public.duel_dice_score(text), public.duel_chest_win(int, int) from public, anon, authenticated;
