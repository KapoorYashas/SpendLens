-- ============================================================
-- SpendLens — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- Table: audits
-- Stores audit inputs and results. Publicly readable by UUID (shareable URLs).
create table if not exists audits (
  id                    uuid primary key default gen_random_uuid(),
  tools                 jsonb not null,
  results               jsonb not null,
  total_monthly_savings integer not null,
  total_annual_savings  integer not null,
  use_case              text,
  team_size             integer,
  ai_summary            text,
  created_at            timestamptz default now()
);

-- Table: leads
-- Stores lead contact info. Insert-only — no public read (PII protection).
create table if not exists leads (
  id         uuid primary key default gen_random_uuid(),
  audit_id   uuid references audits(id),
  email      text not null,
  company    text,
  role       text,
  team_size  integer,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- audits: anyone can insert, anyone can read by id (public shareable URLs)
alter table audits enable row level security;

create policy "Public read"
  on audits for select
  using (true);

create policy "Public insert"
  on audits for insert
  with check (true);

-- leads: insert only, no public read (PII)
alter table leads enable row level security;

create policy "Insert only"
  on leads for insert
  with check (true);
