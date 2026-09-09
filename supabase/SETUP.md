# Supabase setup

Project: `myogttnqpvmhvfjvdtaq` · schema in `schema.sql` (already applied).

## Edge functions (all deployed)

| Function | Auth | Purpose | Secrets needed to go live |
|---|---|---|---|
| `device-checkin` | webhook secret | Biometric device → check-in | none (uses service role) |
| `meal-scan` | member JWT | Photo → dish name (client then pulls macros from the food table) | `GEMINI_API_KEY` (free) or `ANTHROPIC_API_KEY` |
| `whatsapp-send` | owner JWT | Send a WhatsApp message | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` |
| `razorpay-link` | owner JWT | Create a fee payment link | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |

Until a function's secrets are set it returns `{ "configured": false }` and the app falls
back to a simulated result — nothing breaks.

## Setting secrets

Supabase dashboard → **Project Settings → Edge Functions → Secrets**, or CLI:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set WHATSAPP_TOKEN=EAAG... WHATSAPP_PHONE_ID=1234567890
supabase secrets set RAZORPAY_KEY_ID=rzp_test_... RAZORPAY_KEY_SECRET=...
```

### Where to get each

- **GEMINI_API_KEY** (recommended for testing — free) — https://aistudio.google.com/apikey,
  sign in with a Google account, "Create API key". Free tier is ~15 requests/min, 1500/day,
  no card. `meal-scan` uses `gemini-2.0-flash`. Note: Google may use free-tier data for
  training — fine for testing, revisit before production.
- **ANTHROPIC_API_KEY** (paid alternative) — console.anthropic.com → API keys. If set and
  `GEMINI_API_KEY` is not, `meal-scan` uses `claude-haiku-4-5`.
- **WHATSAPP_TOKEN / WHATSAPP_PHONE_ID** — developers.facebook.com → your app → WhatsApp →
  API Setup. The temporary token + test number work immediately; a permanent token needs
  business verification. Proactive win-back messages need an approved message template
  (the built-in `hello_world` template works for testing).
- **RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET** — dashboard.razorpay.com → Settings → API Keys.
  Generate **Test Mode** keys — free and instant.

## Biometric device webhook

```
POST  https://myogttnqpvmhvfjvdtaq.supabase.co/functions/v1/device-checkin
headers:  x-gym-code: IRONHOUSE
          x-webhook-secret: <gyms.webhook_secret — shown in the app under Branding>
body:     { "biometric_id": "ENROLL-0003", "method": "fingerprint" }
          (or "phone", or "member_id"; add "direction":"out" for tap-out)
```

Point an ESSL / ZKTeco ADMS push or CAMS at that URL. Map each member's device enrol id
into `members.biometric_id`.

## Redeploying functions

```bash
supabase functions deploy device-checkin --no-verify-jwt
supabase functions deploy meal-scan
supabase functions deploy whatsapp-send
supabase functions deploy razorpay-link
```
