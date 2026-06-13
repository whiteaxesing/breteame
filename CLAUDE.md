# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ **Next.js 16 / React 19.** The version here ships breaking changes vs. older
> Next.js (see AGENTS.md). Notably: `params` and `searchParams` are **Promises**
> that must be `await`ed in pages/route handlers. Read
> `node_modules/next/dist/docs/` before writing framework code.

## What this is

Breteame is a hackathon-MVP marketplace that connects clients in Costa Rica with
verified tradespeople (plumbers, electricians, locksmiths, gardeners, debris
haulers). Clients search/filter pros and contact them directly via WhatsApp or
phone; every contact is logged as a lead. **Payments, verification, and the
hardware-store QR acquisition channel are all simulated** for the demo
(`is_premium`, `is_verified`, `stores.qr_scans` are just flags/counters — no
Stripe, no external validation).

## Commands

Package manager is **pnpm**.

```bash
pnpm dev      # dev server (Turbopack)
pnpm build    # production build
pnpm start    # serve production build
pnpm lint     # eslint
```

There is **no test framework** in this project — don't assume `pnpm test` exists.

Database / demo setup (require `.env.local`, see README for full flow):

```bash
# Apply schema + seed without the Supabase SQL Editor (needs DATABASE_URL)
node --env-file=.env.local scripts/run-sql.mjs supabase/migrations/0001_init.sql supabase/seed.sql

# Create the 3 demo accounts (needs SUPABASE_SERVICE_ROLE_KEY)
node --env-file=.env.local scripts/seed-users.mjs
```

Demo accounts (password `demo1234`): `cliente@demo.cr`, `pro@demo.cr` (linked to
a seed professional), `admin@demo.cr`.

## Stack & conventions

- Next.js 16 App Router + TypeScript, Tailwind v4, shadcn/ui (style `radix-nova`,
  built on `@base-ui/react` + `radix-ui`; components in `src/components/ui/`).
- Path alias `@/*` → `src/*`.
- **All user-facing copy and code comments are in Costa Rican Spanish (voseo).**
  Domain identifiers are Spanish too (e.g. `registrarContacto`, roles
  `cliente`/`profesional`/`admin`). Match this when adding code.
- `<img>` is used intentionally (the `no-img-element` lint rule is off) because
  photos come from arbitrary hosts; don't "fix" them to `next/image`.

## Architecture

### The security model is the core design (read this first)

The phone number is the protected resource. Protection is layered in Postgres,
not in the app:

- **`professionals` base table has `SELECT` revoked** from `anon`/`authenticated`.
  Read access is granted at the **column level** — `phone` is granted only to
  `authenticated`. App code therefore **reads through views, never the base
  table**:
  - `professionals_public` — no `phone` (used for anonymous + list/admin views).
  - `professionals_with_contact` — includes `phone` (authenticated only).
  - Both are `security_invoker = on`, so the base table's RLS still applies.
- **Writes** (`is_premium`, `is_verified`, status) go to the `professionals` /
  `contacts` base tables via Server Actions, governed by RLS policies.
- **RLS + a trigger both enforce admin-only verification.** Even though a pro can
  update their own row, `guard_professional_verification` silently reverts any
  `is_verified` change made by a non-admin, so a pro cannot self-verify.
- `current_user_role()` is `SECURITY DEFINER` to read `profiles` without
  triggering its own RLS (avoids policy recursion).
- `contacts.client_name` is **denormalized on insert** so a pro can see who
  contacted them without reading another user's `profiles` row (which RLS
  forbids).

See `supabase/migrations/0001_init.sql` for the authoritative schema, views,
grants, policies, and triggers. `src/lib/types.ts` mirrors this schema — keep
the two in sync, and note `ProfessionalPublic` (no phone) vs.
`ProfessionalWithContact` (phone).

### Data flow layers

- **Supabase clients (`src/lib/supabase/`)** — three variants for three
  contexts: `client.ts` (browser, `"use client"`), `server.ts` (Server
  Components / Actions / Route Handlers, reads cookies), `middleware.ts`
  (refreshes the session on every request). All use the **anon key**; security
  lives in RLS, not the key. In `middleware.ts`, `getUser()` must run
  immediately after creating the client with nothing in between — it revalidates
  the token and refreshes the cookie.
- **`middleware.ts` (root)** wraps `updateSession` to keep auth cookies fresh
  across the whole app.
- **Auth helpers (`src/lib/auth.ts`)** — `getCurrentUser()` returns
  `{ user, profile }` (profile carries the app role) or `null`; `hasRole()`
  gates by role. Server Components call these to protect routes and decide what
  to render (e.g. whether to reveal the phone).
- **Server Actions (`src/lib/actions.ts`)** are the only mutation path:
  `registrarContacto`, `setLeadStatus`, `togglePremium`, `toggleVerified`. They
  return `{ ok: true } | { ok: false, error }` and call `revalidatePath` on the
  affected routes.

### Routes (`src/app/`)

`/` (search) · `/login` · `/pro/[id]` (profile; phone hidden behind a login CTA
when anonymous) · `/dashboard` (pro's leads, gated to role `profesional`) ·
`/admin` (verify pros + store scans, gated to role `admin`) ·
`/auth/callback` (OAuth code exchange).

Page-level patterns to follow:

- Every page sets `export const dynamic = "force-dynamic"` (data depends on the
  session).
- Each page guards on an **`isConfigured`** check
  (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and degrades to
  a setup notice instead of crashing when Supabase env vars are missing. Keep
  this guard when adding pages.
- Redirect `next` params are validated to start with `/` to prevent open
  redirects.

### Domain config

- `src/lib/categories.ts` — the 5 active categories (slug, label, icon, colors)
  plus a "Próximamente" (coming soon, non-selectable) list. `CategorySlug` is the
  source of truth for the category enum.
- `src/lib/locations.ts` — curated GAM zones for the location filter; pros store
  location as free text, so filtering is a partial `ilike` match.
