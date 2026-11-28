-- 🛡️ Empire of Coins: size and shape limits for cloud saves (run AFTER supabase-setup.sql).
-- Paste all of this into Supabase → SQL Editor → New query, and click "Run". It is safe to run again.
-- A real save is about 90 KB; the limit leaves 10× room. A save over the limit is refused (the game keeps it on the device and shows a cloud error).

alter table public.saves drop constraint if exists saves_size_ok;
alter table public.saves add constraint saves_size_ok check (
  jsonb_typeof(data) = 'object'
  and octet_length(data::text) < 1000000
  and saved_at > 0 and saved_at < 32503680000000   -- a real time in milliseconds (before the year 3000)
) not valid;   -- "not valid": existing rows aren't checked, only new saves and changes

-- optional: check the rows that are already there too (run it on its own; it fails if an old row is over the limit)
-- alter table public.saves validate constraint saves_size_ok;
