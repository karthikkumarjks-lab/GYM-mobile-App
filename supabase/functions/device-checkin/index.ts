import { createClient } from "jsr:@supabase/supabase-js@2";

// Biometric-device webhook. An ESSL / ZKTeco (or middleware like CAMS) posts a punch here
// and it becomes a check-in. Authenticated by the gym's webhook_secret, not a JWT.
// Deployed with verify_jwt = false.
//
//   POST /functions/v1/device-checkin
//   headers: x-gym-code: IRONHOUSE   x-webhook-secret: <secret>
//   body: { biometric_id?, phone?, member_id?, at?, direction?: "in"|"out", method? }

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch { /* allow empty */ }

  const gymCode = (req.headers.get("x-gym-code") ?? String(payload.gym_code ?? "")).toUpperCase();
  const secret = req.headers.get("x-webhook-secret") ?? String(payload.webhook_secret ?? "");
  if (!gymCode || !secret) return json({ error: "missing gym code or secret" }, 401);

  const { data: gym } = await admin.from("gyms").select("id, webhook_secret").eq("code", gymCode).single();
  if (!gym || gym.webhook_secret !== secret) return json({ error: "bad gym or secret" }, 401);

  let memberId = payload.member_id ? String(payload.member_id) : null;
  if (!memberId && payload.biometric_id) {
    const { data } = await admin.from("members").select("id").eq("gym_id", gym.id).eq("biometric_id", String(payload.biometric_id)).single();
    memberId = data?.id ?? null;
  }
  if (!memberId && payload.phone) {
    const { data } = await admin.from("members").select("id").eq("gym_id", gym.id).eq("phone", String(payload.phone)).single();
    memberId = data?.id ?? null;
  }
  if (!memberId) return json({ error: "member not found — send member_id, biometric_id or phone" }, 404);

  const at = payload.at ? new Date(String(payload.at)).toISOString() : new Date().toISOString();
  const method = (["fingerprint", "face", "qr", "pin", "staff"].includes(String(payload.method)) ? String(payload.method) : "fingerprint") as string;
  const direction = payload.direction === "out" ? "out" : "in";

  if (direction === "out") {
    const since = new Date(Date.now() - 16 * 3600 * 1000).toISOString();
    const { data: open } = await admin.from("checkins")
      .select("id").eq("gym_id", gym.id).eq("member_id", memberId).is("out_at", null).gte("at", since)
      .order("at", { ascending: false }).limit(1).single();
    if (open) {
      await admin.from("checkins").update({ out_at: at }).eq("id", open.id);
      return json({ ok: true, action: "checked_out", member_id: memberId });
    }
  }

  const { data: row, error } = await admin.from("checkins")
    .insert({ gym_id: gym.id, member_id: memberId, at, method })
    .select("id").single();
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, action: "checked_in", checkin_id: row.id, member_id: memberId });
});
