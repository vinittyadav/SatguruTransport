-- ============================================================
-- SATGURU TRANSPORT — DATABASE SCHEMA
-- Run in Supabase SQL editor or via `supabase db push`.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------- Profiles (admin/staff users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- ---------- Content: services ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  description text,
  icon text not null default 'Truck',
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 99,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Content: vehicles ----------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('heavy', 'medium', 'light', 'specialized')),
  title text not null,
  capacity text,
  cargo_suitability text,
  availability text not null default 'on_request' check (availability in ('available', 'on_request', 'unavailable')),
  description text,
  color text not null default '#f5a623',
  sort_order integer not null default 99,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Content: industries ----------
create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  challenge text not null,
  solution text not null,
  icon text not null default 'Factory',
  sort_order integer not null default 99,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Content: FAQs ----------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 99,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Quote requests ----------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  company_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  origin_city text not null,
  destination_city text not null,
  cargo_description text not null,
  cargo_weight_kg integer,
  vehicle_preference text,
  service_type text,
  preferred_pickup_date date,
  notes text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'won', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Contact messages ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- Shipments + events ----------
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  customer_name text,
  origin_city text not null,
  destination_city text not null,
  status text not null default 'booked' check (status in ('booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception')),
  current_location text,
  notes text,
  estimated_delivery date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null check (status in ('booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception')),
  location text,
  note text,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_shipment_events_shipment
  on public.shipment_events (shipment_id, occurred_at desc);
create index if not exists idx_shipments_tracking
  on public.shipments (tracking_code);

-- ---------- Customers ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- Drivers ----------
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  license_number text,
  license_expiry date,
  status text not null default 'active' check (status in ('active', 'on_leave', 'inactive')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.vehicles enable row level security;
alter table public.industries enable row level security;
alter table public.faqs enable row level security;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.customers enable row level security;
alter table public.drivers enable row level security;

-- Helper: is the caller an authenticated admin/staff?
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- ---------- Public read for published content ----------
create policy "Published content is publicly readable"
  on public.services for select
  using (status = 'published' or public.is_staff());

create policy "Published content is publicly readable"
  on public.vehicles for select
  using (status = 'published' or public.is_staff());

create policy "Published content is publicly readable"
  on public.industries for select
  using (status = 'published' or public.is_staff());

create policy "Published content is publicly readable"
  on public.faqs for select
  using (status = 'published' or public.is_staff());

-- ---------- Content writes: staff only ----------
create policy "Staff can manage services"
  on public.services for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff can manage vehicles"
  on public.vehicles for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff can manage industries"
  on public.industries for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff can manage faqs"
  on public.faqs for all
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Quote requests: public insert, staff read/update ----------
create policy "Anyone can submit quote requests"
  on public.quote_requests for insert
  with check (true);

create policy "Staff can view quote requests"
  on public.quote_requests for select
  using (public.is_staff());

create policy "Staff can update quote requests"
  on public.quote_requests for update
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Contact messages: public insert, staff read/update ----------
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Staff can view contact messages"
  on public.contact_messages for select
  using (public.is_staff());

create policy "Staff can update contact messages"
  on public.contact_messages for update
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Shipments: staff full, public read by code (tracking) ----------
create policy "Staff can manage shipments"
  on public.shipments for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Anyone can view shipments (tracking)"
  on public.shipments for select
  using (true);

create policy "Staff can manage shipment events"
  on public.shipment_events for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Anyone can view shipment events (tracking)"
  on public.shipment_events for select
  using (true);

-- ---------- Customers + drivers: staff only ----------
create policy "Staff can manage customers"
  on public.customers for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff can manage drivers"
  on public.drivers for all
  using (public.is_staff()) with check (public.is_staff());

-- ---------- Profiles: users read own, admins manage ----------
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

create policy "Staff can manage profiles"
  on public.profiles for all
  using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create a profile on signup (default role: staff).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep quote_requests.updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_quote_updated on public.quote_requests;
create trigger touch_quote_updated
  before update on public.quote_requests
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_shipment_updated on public.shipments;
create trigger touch_shipment_updated
  before update on public.shipments
  for each row execute function public.touch_updated_at();
