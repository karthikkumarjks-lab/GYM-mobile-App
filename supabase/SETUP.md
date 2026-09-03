# Supabase setup

Project: `myogttnqpvmhvfjvdtaq` · schema in `schema.sql` (already applied).

## Edge functions (all deployed)

| Function | Auth | Purpose | Secrets needed to go live |
|---|---|---|---|
| `device-checkin` | webhook secret | Biometric device → check-in | none (uses service role) |
| `meal-scan` | member JWT | Photo → macros via Claude vision | `ANTHROPIC_API_KEY` |
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

- **ANTHROPIC_API_KEY** — console.anthropic.com → API keys. Meal-scan uses `claude-opus-5`;
  edit `meal-scan/index.ts` to `claude-haiku-4-5` for ~5× lower cost per photo.
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
