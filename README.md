# Satguru Transport — Website + Operations Platform

A premium hybrid 3D + business-system website for Satguru Transport (Maharashtra, India).
Cinematic 3D experiences on top of a real lead-generation, tracking and admin platform.

## Stack

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS**
- **Three.js / React Three Fiber / drei** — procedural 3D (no external assets)
- **Framer Motion** — animation (respects `prefers-reduced-motion`)
- **Supabase** — Postgres, Auth, RLS
- **Zod + React Hook Form** — validation
- **Lucide React** — icons

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Without Supabase env vars the site runs in **demo mode**: full UI with fallback
content; quote/contact submissions are accepted but not persisted; tracking and
admin data views show configured empty states.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env.local` and fill in the four variables.
3. Run `supabase/migrations/0001_schema.sql`, `0002_seed.sql` (optional seed
   content) and `0003_hardening_and_workflow.sql` in the SQL editor.
4. In Supabase Auth, create your admin user, then promote it:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

5. Restart `npm run dev`. Sign in at `/admin/login`.

Full details: [`supabase/README.md`](supabase/README.md).

## Commands

```bash
npm run dev         # dev server
npm run build       # production build
npm run start       # serve production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest (validation, workflow, rate-limit tests)
npm run db:types    # regenerate types/database.ts (requires supabase CLI link)
```

## Business workflow

**Quote pipeline:** NEW → CONTACTED → QUOTED → CONFIRMED → *(convert)* →
shipment. Conversion lives on the admin quote detail page
(`/admin/quotes/[id]`) and:

- is blocked unless the quote is Confirmed/Won,
- is blocked (and DB-enforced by a unique index) if a shipment already exists
  for the quote,
- links `quote_id`, `customer_id`, `vehicle_id`, `driver_id` onto the shipment
  (data is linked, never duplicated),
- find-or-creates the customer record, generates the tracking code and logs
  the opening "Booked" milestone.

**Customer tracking timeline:** Quote Requested → Confirmed → Vehicle
Assigned → In Transit → At Destination → Delivered — derived only from real
records/events. Unknown codes show "Shipment not found."

**Fleet statuses:** AVAILABLE / ASSIGNED / IN_TRANSIT / MAINTENANCE / INACTIVE
(+ legacy show-room values for seeded category rows).

## Spam protection

Public forms (`/quote`, `/contact`) are hardened with: per-IP rate limiting
(5 req / 10 min, in-memory, swap-in-ready for Redis), a hidden honeypot field,
a 16 KB request-size limit, input normalization, and duplicate-submission
detection (same email + route/message within 10 minutes returns the original
reference instead of creating a new row).

## Architecture

```
app/                    public pages + /admin dashboard + /api routes
  admin/(dashboard)/    authed admin: overview, quotes, shipments,
                        messages, content, customers, drivers
  admin/actions.ts      server actions (auth-guarded writes)
components/
  3d/                   Hero3D, HeroScene, TruckModel, FleetViewer,
                        RouteVisualization, Scene3D (capability + fallbacks)
  ui/                   Navbar, Footer, Button, Input/Select/Textarea,
                        Card/Section, Modal, Table, Reveal, Logo
  business/             QuoteForm, TrackingForm, ShipmentTimeline,
                        ServiceCard, IndustryCard, FaqSection, ContactForm
  admin/                AdminShell + dashboard widgets
lib/
  config/site.ts        ⭐ company info, nav, contact, route locations
  config/content.ts     fallback content (demo mode / empty tables)
  content.ts            DB-first content loader with fallback
  supabase/             browser + server + admin clients, middleware
  validation/           Zod schemas
  utils/                codes, formatting, status maps
supabase/migrations/    schema + RLS + seed
types/                  domain types
```

## Editing business content

- **Company info, contact details, navigation, hours** → `lib/config/site.ts`
  (confirmed business contact details are set; edit here to update everywhere).
- **Services / fleet / industries / FAQs** → admin → Content, or directly in
  Supabase. The seed matches `lib/config/content.ts`, which is also the
  demo-mode fallback.

## 3D behavior

`Scene3D` detects WebGL support and a capability tier (`full` / `lite` / `none`):

- **Desktop** — full scene, dpr up to 1.75
- **Mobile / reduced-motion / low-core devices** — lite tier (fewer particles,
  fewer props, reduced detail geometry)
- **No WebGL / scene crash** — static fallback art, error boundary keeps the
  page alive; business content never depends on the 3D layer

## Real-data policy

No invented stats, testimonials, client logos, certifications, fleet counts or
coverage claims. Missing info renders as explicit "to be configured"
placeholders. The route visualization is labeled as a schematic planning aid,
not live tracking or a coverage claim.
