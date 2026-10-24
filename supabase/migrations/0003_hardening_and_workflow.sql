-- ============================================================
-- 0003 — PRODUCTION HARDENING + BUSINESS WORKFLOW
-- Run AFTER 0001_schema.sql (0002_seed.sql is optional seed data).
-- Never edit 0001 destructively; this migration extends it.
--
-- Sections:
--   1. Quote pipeline statuses (contacted / confirmed)
--   2. Shipment workflow links (quote / customer / vehicle / driver)
--   3. Vehicle operations fields (number, driver, reg/insurance expiry)
--   4. Updated_at triggers for remaining tables
--   5. RLS tightening (shipments no longer public-readable;
--      anon insert policies dropped — API writes via service role)
-- ============================================================

-- ------------------------------------------------------------
-- 1. QUOTE PIPELINE
-- ------------------------------------------------------------
-- New pipeline: new → contacted → quoted → confirmed → won/lost
-- ('reviewing' is kept as a legacy value so existing rows stay valid.)
alter table public.quote_requests drop constraint if exists quote_requests_status_check;
alter table public.quote_requests
  add constraint quote_requests_status_check
  check (status in ('new', 'reviewing', 'contacted', 'quoted', 'confirmed', 'won', 'lost'));

-- Fast dashboard count queries.
create index if not exists idx_quote_requests_status
  on public.quote_requests (status);
create index if not exists idx_quote_requests_created
  on public.quote_requests (created_at desc);

-- ------------------------------------------------------------
-- 2. SHIPMENT WORKFLOW LINKS
-- ------------------------------------------------------------
-- New status 'at_destination' joins the milestone set:
-- booked → picked_up → in_transit → at_destination → delivered
alter table public.shipments drop constraint if exists shipments_status_check;
alter table public.shipments
  add constraint shipments_status_check
  check (status in ('booked', 'picked_up', 'in_transit', 'at_destination', 'out_for_delivery', 'delivered', 'exception'));

alter table public.shipment_events drop constraint if exists shipment_events_status_check;
alter table public.shipment_events
  add constraint shipment_events_status_check
  check (status in ('booked', 'picked_up', 'in_transit', 'at_destination', 'out_for_delivery', 'delivered', 'exception'));

-- Provenance links. All nullable: manual shipments stay valid.
alter table public.shipments
  add column if not exists quote_id uuid references public.quote_requests(id) on delete set null;
alter table public.shipments
  add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.shipments
  add column if not exists vehicle_id uuid references public.vehicles(id) on delete set null;
alter table public.shipments
  add column if not exists driver_id uuid references public.drivers(id) on delete set null;

-- One shipment per quote (duplicate-conversion guard at the DB level).
create unique index if not exists idx_shipments_quote_id
  on public.shipments (quote_id)
  where quote_id is not null;

create index if not exists idx_shipments_status
  on public.shipments (status);
create index if not exists idx_shipments_created
  on public.shipments (created_at desc);

-- ------------------------------------------------------------
-- 3. VEHICLE OPERATIONS FIELDS
-- ------------------------------------------------------------
-- Operations statuses: AVAILABLE / ASSIGNED / IN_TRANSIT / MAINTENANCE / INACTIVE
-- The legacy show-room value 'on_request' is kept so seeded rows stay valid;
-- the admin UI writes only the new values.
alter table public.vehicles drop constraint if exists vehicles_availability_check;
alter table public.vehicles
  add constraint vehicles_availability_check
  check (availability in ('available', 'assigned', 'in_transit', 'maintenance', 'inactive', 'on_request', 'unavailable'));

-- vehicle_number is the business identifier of a real truck (nullable:
-- showroom/summary rows such as the seeded categories do not have one).
alter table public.vehicles
  add column if not exists vehicle_number text;
create unique index if not exists idx_vehicles_vehicle_number
  on public.vehicles (vehicle_number)
  where vehicle_number is not null;

alter table public.vehicles
  add column if not exists driver_id uuid references public.drivers(id) on delete set null;
alter table public.vehicles
  add column if not exists registration_expiry date;
alter table public.vehicles
  add column if not exists insurance_expiry date;

create index if not exists idx_vehicles_status
  on public.vehicles (availability);

-- ------------------------------------------------------------
-- 4. UPDATED_AT TRIGGERS (parity with quote_requests/shipments)
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_contact_updated on public.contact_messages;
create trigger touch_contact_updated
  before update on public.contact_messages
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 5. RLS TIGHTENING
-- ------------------------------------------------------------
-- Shipments + events were world-readable (`using (true)`). Tracking lookups
-- go through the server's service-role client, so public SELECT is pure
-- exposure (customer names, routes, event history). Revoke it.
drop policy if exists "Anyone can view shipments (tracking)" on public.shipments;
drop policy if exists "Anyone can view shipment events (tracking)" on public.shipment_events;

-- Public INSERT on quotes/messages is unnecessary: submissions go through
-- /api/quotes + /api/contact which use the server-only service-role client.
-- (These policies were also a spam-write vector for anyone holding the
-- public anon key.)
drop policy if exists "Anyone can submit quote requests" on public.quote_requests;
drop policy if exists "Anyone can submit contact messages" on public.contact_messages;

-- CONTENT_ADMIN is intentionally NOT granted to anon/authenticated. The admin
-- panel uses the service-role connection; granting table access to broad
-- roles would silently re-open the holes closed above.
revoke all on public.quote_requests from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
revoke all on public.shipments from anon, authenticated;
revoke all on public.shipment_events from anon, authenticated;
revoke all on public.customers from anon, authenticated;
revoke all on public.drivers from anon, authenticated;
