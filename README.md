# Momentum — gym app (test build)

One shared web app; each gym is a tenant with its own branding. Members install it to
their home screen (PWA). Native store apps and biometric hardware come later.

## Status

- **Backend:** localStorage mock (zero setup). Runs and deploys with no accounts.
- **Next:** point at Supabase (`supabase/schema.sql`) by setting `VITE_SUPABASE_URL` +
  `VITE_SUPABASE_ANON_KEY`. The data-layer contract in `src/lib/db.ts` stays the same.

## What works now

| Owner (`/owner`) | Member (`/m`) |
| --- | --- |
| Dashboard — check-ins today, in-now, active, going-quiet | Home — streak, today's plan, weekly/monthly counts |
| Members — list, search, add, one-tap check-in | Check in — tap (stands in for QR / face / fingerprint) |
| Win-back radar — at-risk list + "Run win-back" drafts simulated WhatsApp messages | Meal scan — photo → sample macro estimate → log |
| Branding — gym name, city, accent colour (live) | |

Simulated for the test build: WhatsApp sends, payments, biometric devices, the vision model.

## Run

```bash
npm install
npm run dev
```

Sign in on `/login` — pick "gym owner" or any member, no password. "Reset demo data"
wipes localStorage back to the seed.

## Deploy (Vercel)

Framework preset **Vite**, build `npm run build`, output `dist`. `vercel.json` adds the
SPA rewrite so client routes work on refresh.
