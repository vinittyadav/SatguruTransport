-- ============================================================
-- SEED DATA — matches lib/config/content.ts fallbacks.
-- Run 0001_schema.sql first.
-- ============================================================

insert into public.services (slug, title, short_description, description, icon, features, sort_order, status) values
  ('full-truckload', 'Full Truckload Transportation', 'Dedicated vehicles for point-to-point movement of your commercial cargo.', 'A dedicated vehicle for your shipment, moving directly from pickup to destination without consolidation. Suited for larger loads that need the full capacity of a truck.', 'Truck', '["Dedicated vehicle for your load","Direct point-to-point routing","Suitable for heavy and bulky cargo"]', 1, 'published'),
  ('part-load', 'Part Load Transportation', 'Cost-efficient transport when your shipment doesn''t need a full vehicle.', 'Share vehicle space with compatible cargo moving along the same corridor. A cost-efficient option for smaller commercial shipments.', 'Boxes', '["Pay for the space you use","Consolidated along shared corridors","Scheduled departures"]', 2, 'published'),
  ('dedicated-transportation', 'Dedicated Transportation', 'Vehicles assigned to your operation on an ongoing basis.', 'Reserve vehicles for recurring or contract-based movement. Built for businesses that need guaranteed capacity on regular routes.', 'Repeat', '["Recurring route capacity","Priority scheduling","Consistent vehicle assignment"]', 3, 'published'),
  ('industrial-transportation', 'Industrial Transportation', 'Movement of industrial goods, machinery and plant materials.', 'Transport for manufacturing inputs, machinery components and industrial equipment, planned around site requirements.', 'Factory', '["Machinery and plant material movement","Site-coordinated pickups","Load planning support"]', 4, 'published'),
  ('commercial-goods', 'Commercial Goods Transportation', 'Dependable movement for retail and trade cargo across the region.', 'Reliable movement of commercial goods for traders, distributors and retail businesses.', 'PackageCheck', '["Retail and trade cargo","Flexible scheduling","Careful handling standards"]', 5, 'published'),
  ('fleet-solutions', 'Fleet Solutions', 'Vehicle capacity arranged around your business operation.', 'Access vehicle capacity as your operation requires — per trip, per route, or per period — without maintaining your own fleet.', 'LayoutGrid', '["Capacity on demand","Route-based arrangements","Operational support"]', 6, 'published'),
  ('long-distance', 'Long-Distance Transportation', 'Intercity and interstate movement of commercial cargo.', 'Planned long-haul movement between cities and states, with realistic transit expectations communicated upfront.', 'Route', '["Intercity and interstate routes","Planned transit schedules","Status communication"]', 7, 'published'),
  ('logistics-coordination', 'Logistics Coordination', 'One point of contact for multi-leg or multi-vehicle movements.', 'Coordination of vehicles, schedules and handoffs for movements that involve more than one leg — so your team talks to one person, not five.', 'Workflow', '["Single point of contact","Multi-leg planning","Schedule synchronization"]', 8, 'published')
on conflict (slug) do nothing;

insert into public.vehicles (slug, category, title, capacity, cargo_suitability, availability, description, color, sort_order, status) values
  ('heavy-truck', 'heavy', 'Heavy Trucks', null, null, 'on_request', 'Full-size commercial trucks for heavy and long-haul loads. Specifications to be configured.', '#f5a623', 1, 'published'),
  ('medium-truck', 'medium', 'Medium Trucks', null, null, 'on_request', 'Versatile mid-size trucks for regional distribution. Specifications to be configured.', '#d97b29', 2, 'published'),
  ('light-commercial', 'light', 'Light Commercial Vehicles', null, null, 'on_request', 'Nimble vehicles for city deliveries and smaller loads. Specifications to be configured.', '#8b99ac', 3, 'published'),
  ('specialized', 'specialized', 'Specialized Vehicles', null, null, 'on_request', 'Vehicles configured for specific cargo requirements. Specifications to be configured.', '#4f8ef7', 4, 'published')
on conflict (slug) do nothing;

insert into public.industries (slug, title, challenge, solution, icon, sort_order, status) values
  ('manufacturing', 'Manufacturing', 'Production lines stall when raw material and finished-goods movement is unpredictable.', 'Scheduled vehicle capacity and direct routing to keep plants supplied and dispatches moving.', 'Factory', 1, 'published'),
  ('automotive', 'Automotive', 'Components and spare parts must arrive in sequence and on time to avoid line-down events.', 'Dedicated vehicles with careful handling and planned pickup windows for parts movement.', 'Car', 2, 'published'),
  ('construction', 'Construction', 'Materials are heavy, sites are remote, and delays cascade across the project schedule.', 'Heavy vehicles and site-coordinated delivery planned around project timelines.', 'HardHat', 3, 'published'),
  ('retail', 'Retail', 'Stores need frequent, reliable replenishment without over-ordering stock.', 'Part-load and scheduled distribution options that match store replenishment cycles.', 'Store', 4, 'published'),
  ('fmcg', 'FMCG', 'High volumes and tight windows leave no room for missed pickups.', 'Consistent capacity and responsive communication for fast-moving consumer goods.', 'ShoppingCart', 5, 'published'),
  ('industrial-equipment', 'Industrial Equipment', 'Oversized and sensitive equipment needs the right vehicle and careful load planning.', 'Vehicle selection matched to the load, with coordination from pickup to placement.', 'Wrench', 6, 'published'),
  ('agriculture', 'Agriculture', 'Seasonal peaks demand flexible capacity and produce needs timely movement.', 'Seasonal capacity arrangements with priority scheduling during harvest windows.', 'Wheat', 7, 'published'),
  ('ecommerce', 'E-commerce', 'Order volumes fluctuate and fulfillment depends on dependable linehaul capacity.', 'Flexible linehaul capacity between warehouses and distribution points.', 'ShoppingBag', 8, 'published')
on conflict (slug) do nothing;

insert into public.faqs (question, answer, sort_order, status) values
  ('Which routes does Satguru Transport operate?', 'We operate transportation services across Maharashtra, with intercity and interstate capability depending on the load. Contact us with your route and we will confirm what we can operate.', 1, 'published'),
  ('How do I get a price for my shipment?', 'Submit the quote form with your route, cargo and timing. We respond with a tailored quote — there is no generic pricing because every load is different.', 2, 'published'),
  ('Can I track my shipment?', 'Yes. Once your shipment is booked you receive a tracking code. Enter it on the Tracking page to see the current status and history of milestones.', 3, 'published'),
  ('What information do you need to arrange a vehicle?', 'Pickup and destination, cargo description and approximate weight, preferred date, and any vehicle preference. The quote form collects all of this.', 4, 'published'),
  ('Do you handle part loads, or only full vehicles?', 'Both. Full truckload moves your cargo on a dedicated vehicle; part load consolidates compatible cargo along the same corridor to reduce cost.', 5, 'published'),
  ('How far in advance should I book?', 'For planned loads, a few days'' notice lets us assign the right vehicle. For urgent requirements, contact us directly and we will confirm availability.', 6, 'published');
