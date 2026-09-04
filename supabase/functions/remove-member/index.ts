import { createClient } from "jsr:@supabase/supabase-js@2";

// Owner/admin-only: remove a person from the gym. verify_jwt = true.
// body: { member_id?: uuid, profile_id?: uuid }
// Deletes the members row (cascades check-ins / plans / meals / orders) and the linked
// login (auth user -> profile cascades). Cannot remove the gym owner.

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  const { data: caller } = await admin.from("profiles").select("gym_id, role").eq("id", auth.user.id).maybeSingle();
  if (!caller?.gym_id || !["owner", "co-owner", "admin"].includes(caller.role)) {
    return json({ error: "Only an owner or admin can remove people" }, 403);
  }

  let p: Record<string, unknown> = {};
  try {
    p = await req.json();
  } catch {
    return json({ error: "bad body" }, 400);
  }
  const memberId = p.member_id ? String(p.member_id) : null;
  let profileId = p.profile_id ? String(p.profile_id) : null;

  if (memberId && !profileId) {
    const { data: prof } = await admin.from("profiles").select("id").eq("member_id", memberId).maybeSingle();
    profileId = prof?.id ?? null;
  }

  const target = profileId
    ? (await admin.from("profiles").select("gym_id, role").eq("id", profileId).maybeSingle()).data
    : (await admin.from("members").select("gym_id").eq("id", memberId!).maybeSingle()).data;
  if (!target || target.gym_id !== caller.gym_id) return json({ error: "not in your gym" }, 404);
  if (profileId && (target as { role?: string }).role === "owner") {
    return json({ error: "The gym owner can't be removed" }, 400);
  }

  if (profileId) await admin.auth.admin.deleteUser(profileId); // cascades the profile row
  if (memberId) await admin.from("members").delete().eq("id", memberId);

  return json({ ok: true });
});
