import { createClient } from "jsr:@supabase/supabase-js@2";

// Create a Razorpay payment link for a member's fee and record it.
// Needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (test-mode fine). Without them: simulated.
// verify_jwt = true. body: { member_id?, amount_paise, purpose? }

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "content-type": "application/json" } });
const admin = createClient(URL, SERVICE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth } = await admin.auth.getUser(jwt);
  if (!auth.user) return json({ error: "not signed in" }, 401);
  const { data: prof } = await admin.from("profiles").select("gym_id, role").eq("id", auth.user.id).maybeSingle();
  if (!prof?.gym_id || !(["owner", "staff"].includes(prof.role))) return json({ error: "owner only" }, 403);

  let p: Record<string, unknown> = {};
  try {
    p = await req.json();
  } catch {
    return json({ error: "bad body" }, 400);
  }
  const amount = Math.round(Number(p.amount_paise));
  if (!Number.isFinite(amount) || amount < 100) return json({ error: "amount_paise must be >= 100" }, 400);
  const memberId = p.member_id ? String(p.member_id) : null;
  const purpose = p.purpose ? String(p.purpose).slice(0, 120) : "Gym fee";

  let linkUrl: string | null = null;
  let providerRef: string | null = null;
  let status = "simulated";

  if (KEY_ID && KEY_SECRET) {
    const r = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: { authorization: "Basic " + btoa(`${KEY_ID}:${KEY_SECRET}`), "content-type": "application/json" },
      body: JSON.stringify({ amount, currency: "INR", description: purpose, reminder_enable: true }),
    });
    const out = await r.json();
    if (!r.ok) return json({ configured: true, ok: false, error: out }, 502);
    linkUrl = out.short_url;
    providerRef = out.id;
    status = "created";
  }

  const { data: row, error } = await admin
    .from("payments")
    .insert({
      gym_id: prof.gym_id, member_id: memberId, amount_paise: amount, purpose,
      provider: "razorpay", provider_ref: providerRef, status, link_url: linkUrl,
    })
    .select()
    .single();
  if (error) return json({ error: error.message }, 500);

  return json({ configured: Boolean(KEY_ID && KEY_SECRET), payment: row });
});
