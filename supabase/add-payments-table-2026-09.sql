-- =========================================================
-- Body Temple Gym — Payment Management Migration
-- Run this once in Supabase SQL Editor (Project → SQL Editor)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Add fees_due to members
--    fees_due = what the member is charged for the current term
--    fees_paid = what has actually been collected (already exists)
--    outstanding = fees_due - fees_paid
-- ---------------------------------------------------------
alter table public.members
  add column if not exists fees_due numeric(10, 2) not null default 0;

-- Backfill: set fees_due from the membership plan's fee_amount
-- for any member who currently has fees_due = 0 but fees_paid > 0
-- (i.e., they were enrolled before this migration)
update public.members m
set fees_due = mp.fee_amount
from public.membership_plans mp
where m.plan_id = mp.id
  and m.fees_due = 0
  and m.fees_paid > 0;

-- ---------------------------------------------------------
-- 2. payments table
--    One row per payment transaction.
--    A member can have multiple payments against a single term
--    (partial payments), or across many terms.
-- ---------------------------------------------------------
create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members(id) on delete cascade,
  renewal_id uuid references public.renewals(id) on delete set null,
  amount     numeric(10, 2) not null check (amount > 0),
  method     text not null default 'cash'
             check (method in ('cash', 'upi', 'card')),
  note       text,
  paid_at    timestamptz not null default now()
);

create index if not exists idx_payments_member_id on public.payments(member_id);
create index if not exists idx_payments_paid_at   on public.payments(paid_at desc);
create index if not exists idx_payments_method    on public.payments(method);

-- ---------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------
alter table public.payments enable row level security;

drop policy if exists "Admins can read payments"   on public.payments;
create policy "Admins can read payments" on public.payments
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can insert payments" on public.payments;
create policy "Admins can insert payments" on public.payments
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admins can delete payments" on public.payments;
create policy "Admins can delete payments" on public.payments
  for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- 4. Backfill: create a payment record for every existing
--    renewal so history isn't empty on first launch.
--    Safe to run once — skips members who already have payment rows.
-- ---------------------------------------------------------
insert into public.payments (member_id, renewal_id, amount, method, note, paid_at)
select
  r.member_id,
  r.id as renewal_id,
  r.amount,
  'cash' as method,
  'Migrated from renewal history' as note,
  r.created_at as paid_at
from public.renewals r
where r.amount > 0
  and not exists (
    select 1 from public.payments p where p.renewal_id = r.id
  );

-- ---------------------------------------------------------
-- 5. Realtime (optional)
-- ---------------------------------------------------------
alter publication supabase_realtime add table public.payments;
