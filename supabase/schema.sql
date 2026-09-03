-- Momentum gym app — schema + row-level security
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists gyms (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  name       text not null,
  city       text,
  logo_url   text,
  accent     text default '#F5533D',
  created_at timestamptz default now()
);

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  gym_id     uuid references gyms(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner','staff','member')),
  full_name  text,
  member_id  uuid,
  created_at timestamptz default now()
);

create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  gym_id     uuid not null references gyms(id) on delete cascade,
  full_name  text not null,
  phone      text,
  plan       text,
  joined_on  date default current_date,
  status     text not null default 'active' check (status in ('active','frozen','expired')),
  created_at timestamptz default now()
);

alter table profiles
  add constraint profiles_member_fk
  foreign key (member_id) references members(id) on delete set null;

create table if not exists checkins (
  id        uuid primary key default gen_random_uuid(),
  gym_id    uuid not null references gyms(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  at        timestamptz not null default now(),
  out_at    timestamptz,
  method    text not null default 'staff' check (method in ('qr','pin','staff','face','fingerprint'))
);
create index if not exists checkins_gym_at on checkins (gym_id, at desc);
create index if not exists checkins_member_at on checkins (member_id, at desc);

create table if not exists plans (
  id          uuid primary key default gen_random_uuid(),
  gym_id      uuid not null references gyms(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  title       text not null,
  day_label   text,
  exercises   jsonb default '[]',
  assigned_by text,
  created_at  timestamptz default now()
);

-- win-back / reminder outbox. status 'simulated' = shown in app, not actually sent.
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  gym_id     uuid not null references gyms(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  channel    text not null default 'whatsapp',
  template   text,
  body       text not null,
  status     text not null default 'simulated' check (status in ('queued','sent','simulated')),
  created_at timestamptz default now()
);
create index if not exists messages_gym on messages (gym_id, created_at desc);

create table if not exists meals (
  id         uuid primary key default gen_random_uuid(),
  gym_id     uuid not null references gyms(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  at         timestamptz not null default now(),
  label      text,
  kcal       int, protein_g int, carbs_g int, fat_g int,
  photo_url  text
);

-- ---------- helpers ----------
create or replace function auth_gym_id() returns uuid
language sql stable security definer set search_path = public as $$
  select gym_id from profiles where id = auth.uid()
$$;

create or replace function auth_role() returns text
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function auth_member_id() returns uuid
language sql stable security definer set search_path = public as $$
  select member_id from profiles where id = auth.uid()
$$;

-- ---------- row-level security ----------
alter table gyms     enable row level security;
alter table profiles enable row level security;
alter table members  enable row level security;
alter table checkins enable row level security;
alter table plans    enable row level security;
alter table messages enable row level security;
alter table meals    enable row level security;

-- gyms: readable by anyone signed in (needed to look up a gym by code at onboarding);
-- only the owner can change their own gym row.
create policy gyms_read   on gyms for select using (true);
create policy gyms_write  on gyms for update using (id = auth_gym_id() and auth_role() = 'owner');

-- profiles: you see profiles in your gym; you can create/patch your own row.
create policy prof_read   on profiles for select using (gym_id = auth_gym_id());
create policy prof_insert on profiles for insert with check (id = auth.uid());
create policy prof_update on profiles for update using (id = auth.uid());

-- everything else: same-gym read for all; writes for owner/staff, or the member on their own rows.
create policy mem_read  on members for select using (gym_id = auth_gym_id());
create policy mem_write on members for all
  using (gym_id = auth_gym_id() and auth_role() in ('owner','staff'))
  with check (gym_id = auth_gym_id() and auth_role() in ('owner','staff'));

create policy chk_read  on checkins for select using (gym_id = auth_gym_id());
create policy chk_write on checkins for insert with check (
  gym_id = auth_gym_id()
  and (auth_role() in ('owner','staff') or member_id = auth_member_id())
);
create policy chk_update on checkins for update using (
  gym_id = auth_gym_id() and (auth_role() in ('owner','staff') or member_id = auth_member_id())
);

create policy plan_read  on plans for select using (gym_id = auth_gym_id());
create policy plan_write on plans for all
  using (gym_id = auth_gym_id() and auth_role() in ('owner','staff'))
  with check (gym_id = auth_gym_id() and auth_role() in ('owner','staff'));

create policy msg_read  on messages for select using (gym_id = auth_gym_id());
create policy msg_write on messages for all
  using (gym_id = auth_gym_id() and auth_role() in ('owner','staff'))
  with check (gym_id = auth_gym_id() and auth_role() in ('owner','staff'));

create policy meal_read  on meals for select using (gym_id = auth_gym_id());
create policy meal_write on meals for insert with check (
  gym_id = auth_gym_id()
  and (auth_role() in ('owner','staff') or member_id = auth_member_id())
);

-- ---------- integrations (added later) ----------
alter table members add column if not exists biometric_id text;
create index if not exists members_biometric on members (gym_id, biometric_id);

alter table gyms add column if not exists webhook_secret text not null
  default replace(gen_random_uuid()::text, '-', '');

create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  gym_id       uuid not null references gyms(id) on delete cascade,
  member_id    uuid references members(id) on delete set null,
  amount_paise int not null,
  purpose      text,
  provider     text not null default 'razorpay',
  provider_ref text,
  status       text not null default 'created' check (status in ('created','paid','failed','simulated')),
  link_url     text,
  created_at   timestamptz default now()
);
create index if not exists payments_gym on payments (gym_id, created_at desc);
alter table payments enable row level security;
create policy pay_read  on payments for select using (gym_id = auth_gym_id());
create policy pay_write on payments for all
  using (gym_id = auth_gym_id() and auth_role() in ('owner','staff'))
  with check (gym_id = auth_gym_id() and auth_role() in ('owner','staff'));

-- Edge functions: supabase/functions/{device-checkin, meal-scan, whatsapp-send, razorpay-link}
-- Secrets they need are in supabase/SETUP.md.
