import { createClient } from "jsr:@supabase/supabase-js@2";

// Owner-only: add a member to the roster AND create their login in one step.
// Members cannot self-register anywhere in the app. Deployed with verify_jwt = true.
// body: { full_name, email, password, phone?, plan? }

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

  const { data: prof } = await admin.from("profiles").select("gym_id, role").eq("id", auth.user.id).maybeSingle();
  if (!prof?.gym_id || !(["owner", "staff"].includes(prof.role))) {
    return json({ error: "Only the gym owner can add members" }, 403);
  }

  let p: Record<string, unknown> = {};
  try {
    p = await req.json();
  } catch {
    return json({ error: "bad body" }, 400);
  }
  const full_name = String(p.full_name ?? "").trim();
  const email = String(p.email ?? "").trim().toLowerCase();
  const password = String(p.password ?? "");
  const phone = p.phone ? String(p.phone).trim() : null;
  const plan = p.plan ? String(p.plan) : "Monthly";
  if (!full_name || !email || password.length < 6) {
    return json({ error: "Need full name, email, and a password of at least 6 characters" }, 400);
  }

  const { data: member, error: mErr } = await admin
    .from("members")
    .insert({ gym_id: prof.gym_id, full_name, phone, plan })
    .select()
    .single();
  if (mErr) return json({ error: mErr.message }, 500);

  const { data: created, error: uErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (uErr || !created.user) {
    await admin.from("members").delete().eq("id", member.id);
    return json({ error: /registered|already/i.test(uErr?.message ?? "") ? "That email already has an account" : (uErr?.message ?? "could not create login") }, 400);
  }

  const { error: pErr } = await admin.from("profiles").insert({
    id: created.user.id,
    gym_id: prof.gym_id,
    role: "member",
    full_name,
    member_id: member.id,
  });
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    await admin.from("members").delete().eq("id", member.id);
    return json({ error: pErr.message }, 500);
  }

  return json({ member });
});
