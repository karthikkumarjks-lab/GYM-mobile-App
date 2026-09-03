# Momentum — gym app (test build)

One shared web app; each gym is a tenant with its own branding. Members install it to
their home screen (PWA). Native store apps and biometric hardware come later.

## Backend

Live on **Supabase** (Postgres + Auth + row-level security). Schema in
`supabase/schema.sql`. With `VITE_SUPABASE_URL` unset the app falls back to a
localStorage mock so it still runs with no backend.

Env (`.env.local`, gitignored — set the same two in Vercel):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...        # publishable key, safe in the client
```

## Demo logins

No password prompt — the login screen signs into seeded accounts (`…@ironhouse.test`,
password `ironhouse`). Gym owner + 8 members (Arjun, Sana, Rohit, Divya, Karan, Priya,
Mohit, Tara). Seed data: 24 members, ~500 check-ins over 40 days, 4 members at risk / 5
slipping so the win-back radar has something to do.

## What works

| Owner (`/owner`) | Member (`/m`) |
| --- | --- |
| Dashboard — check-ins today, in-now, active, going-quiet | Home — streak, today's plan, weekly/monthly counts |
| Members — list, search, add, one-tap check-in | Check in — tap (stands in for QR / face / fingerprint) |
| Win-back radar — at-risk list + "Run win-back" writes simulated WhatsApp messages | Meal scan — photo → sample macro estimate → log |
| Branding — gym name, city, accent colour (live) | |

Simulated for the test build: WhatsApp sends, payments, biometric devices, the vision model.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the two Supabase values
npm run dev
```

## Deploy (Vercel)

Import the repo, framework preset **Vite**, add the two env vars above. `vercel.json`
adds the SPA rewrite so client routes survive a refresh.
