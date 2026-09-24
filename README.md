# Body Temple Gym — Admin

Member management admin panel for Body Temple Gym. Next.js (App Router) +
TypeScript + Tailwind CSS v4, backed by Supabase.

## What's here

- **Auth** — Supabase email/password login, route-protected `/dashboard`
- **Dashboard** — stat cards, revenue chart, expiring-soon panel
- **Members** — search/filter/sort/paginate, add/edit forms with
  auto-calculated end dates, member detail page, delete
- **CSV export** — with live preview
- **Google Sheets sync** — two-way: DB→Sheets (webhook-triggered) and
  Sheets→DB (Apps Script–triggered)

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's up, open **SQL Editor** → New query, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `members`, `membership_plans`, and `admin_profiles` tables, RLS
   policies, and triggers (auto-expiry, `updated_at`), and seeds four
   starter plans.
3. Go to **Authentication → Users → Add user** and create your first admin
   login (email + password). A matching row in `admin_profiles` is created
   automatically by a trigger.
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this one secret — server-only)

## 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in the Supabase values
from above:

```bash
cp .env.local.example .env.local
```

The `GOOGLE_SHEETS_*` and `SHEET_WEBHOOK_SECRET` values are only needed if
you're wiring up the Sheets sync (step 4) — the app runs fine without them.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected
to `/login`; sign in with the admin user you created in step 1.

## 4. (Optional) Google Sheets sync

The brief calls for a two-way mirror between the `members` table and a
Google Sheet. The API side is built; wiring it up takes two steps:

**DB → Sheets (push):**
1. Create a Google Cloud service account, enable the Sheets API, and share
   your target spreadsheet with the service account's email (Editor
   access).
2. Add `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CLIENT_EMAIL`,
   `GOOGLE_SHEETS_PRIVATE_KEY`, and a `SHEET_WEBHOOK_SECRET` of your choosing
   to your env vars (locally and in Vercel).
3. In Supabase: **Database → Webhooks → Create a new webhook** on the
   `members` table (insert/update/delete) → HTTP Request →
   `POST https://<your-app>.vercel.app/api/sheet-sync/push`, with header
   `x-webhook-secret: <your SHEET_WEBHOOK_SECRET>`.

**Sheets → DB (pull):**
1. In your Google Sheet: **Extensions → Apps Script**.
2. Add an `onEdit(e)` trigger that reads the edited row/column and `POST`s
   `{ id, field, value }` to
   `https://<your-app>.vercel.app/api/sheet-sync/pull`, with the same
   `x-webhook-secret` header.
3. Conflict rule: the database is treated as the source of truth. The pull
   route trusts inbound sheet edits outright rather than diffing
   timestamps — see the comment in `src/app/api/sheet-sync/pull/route.ts`.

Both routes are in `src/app/api/sheet-sync/`.

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel
   project settings (Production + Preview).
4. Deploy. Vercel builds and deploys automatically on every push.

## Project structure

```
src/
├── app/
│   ├── login/              # Login page + form
│   ├── dashboard/          # Protected admin area
│   │   ├── members/        # List, detail, new, edit
│   │   └── export/         # CSV export
│   └── api/sheet-sync/     # Sheets push/pull webhooks
├── components/             # UI components
├── lib/
│   ├── supabase/           # Browser/server/middleware clients
│   ├── members.ts          # Member queries + dashboard stats
│   └── plans.ts            # Membership plan queries
└── types/database.ts       # Hand-written Supabase schema types
supabase/schema.sql          # Full DB schema — run this first
```

### A note on `types/database.ts`

The table/row types are written as `type` aliases, not `interface`s. This
isn't a style preference — `@supabase/postgrest-js`'s internal conditional
types (used by `.eq()`, `.update()`, etc.) fail to resolve against
`interface`-declared shapes in this version and silently fall back to
`never`, which breaks type-checking everywhere those tables are queried.
Plain `type` aliases resolve correctly, which is also what
`supabase gen types typescript` itself emits. If you regenerate this file
from the Supabase CLI later, keep it as `type`.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres,
Auth, RLS) · Recharts · `@fontsource/geist-sans` (self-hosted, avoids a
Google Fonts fetch at build time)

