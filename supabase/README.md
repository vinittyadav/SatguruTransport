# Supabase Setup

## Local stack (already working on this machine)

A full local Supabase (Postgres 17 + Auth + Data API) runs in Docker:

```bash
open -a Docker            # start Docker Desktop
npx supabase start        # applies supabase/migrations/* automatically
```

- API: http://127.0.0.1:54321 · DB: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- `.env.local` already points at this stack. Keys are CLI-issued dev keys.
- Studio is disabled in `supabase/config.toml` (its container bind-mount is
  blocked by Docker file-sharing on this machine; nothing else needs it).
- Seeded admin user: **admin@satgurutransport.in / Satguru!Admin2026** (profile
  promoted to `admin`). There is also a demo quote (`SGT-XSM2V8`) already
  converted to tracked shipment **SGT-700100**.
- Reset everything with `npx supabase db reset`.

## Hosted production project

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com).
2. Note the **Project URL** and **anon key** (Settings → API).
3. Copy the **service_role key** (Settings → API) — server-only, never commit it.

## 2. Apply migrations

In the Supabase dashboard open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_seed.sql` (optional seed content)
3. `supabase/migrations/0003_hardening_and_workflow.sql`

**0003** adds the business workflow and hardening: quote statuses
`contacted`/`confirmed`, shipment links (`quote_id`, `customer_id`,
`vehicle_id`, `driver_id`), a one-shipment-per-quote unique index, the
`at_destination` milestone, vehicle operations fields (`vehicle_number`,
`driver_id`, `registration_expiry`, `insurance_expiry`), and RLS tightening —
shipments/events are no longer publicly readable, and anon INSERT policies on
quote/message tables are dropped (submissions go through the server API).

## 3. Configure the app

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart the dev server after changing env files.

## 4. Create the first admin user

1. Supabase dashboard → **Authentication → Users → Add user** (email + password, confirm immediately).
2. SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

The signup trigger creates a `staff` profile automatically; promote it to
`admin` for full access. Sign in at `/admin/login`.

## Notes

- **Demo mode:** without env vars the site renders with fallback content and
  accepts form submissions without persisting them.
- **RLS:** after 0003, no table grants exist for `anon`/`authenticated` on
  operational tables — ALL reads/writes go through server code. Public content
  (services/fleet/industries/faqs) remains publicly readable via RLS.
- **Roles:** every admin server action verifies the caller's profile role
  (`admin`/`staff`) server-side; users without a staff profile are signed out
  at the dashboard gate. `deleteContent` additionally requires `admin`.
- `npm run db:types` regenerates `types/database.ts` once the Supabase CLI is
  linked (`supabase link --project-ref <ref>`).
