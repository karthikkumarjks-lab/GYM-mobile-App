import { createClient } from "jsr:@supabase/supabase-js@2";

// Owner/admin-only: add a person to the gym + create their login in one step.
// Deployed with verify_jwt = true.
// body: { full_name, email, password, role?, phone?, plan? }
//   role in ('member','staff','admin','co-owner'). 'member' also gets a members roster
//   row; staff roles get a profile only. Members cannot self-register.

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ROLES = ["member", "staff", "admin", "co-owner"];

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
    return json({ error: "Only an owner or admin can add people" }, 403);
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
  const role = ROLES.includes(String(p.role)) ? String(p.role) : "member";
  const phone = p.phone ? String(p.phone).trim() : null;
  const plan = p.plan ? String(p.plan) : "Monthly";
  if (!full_name || !email || password.length < 6) {
    return json({ error: "Need full name, email, and a password of at least 6 characters" }, 400);
  }

  let memberId: string | null = null;
  if (role === "member") {
    const { data: member, error: mErr } = await admin
      .from("members")
      .insert({ gym_id: caller.gym_id, full_name, phone, plan })
      .select()
      .single();
    if (mErr) return json({ error: mErr.message }, 500);
    memberId = member.id;
  }

  const { data: created, error: uErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (uErr || !created.user) {
    if (memberId) await admin.from("members").delete().eq("id", memberId);
    return json({ error: /registered|already/i.test(uErr?.message ?? "") ? "That email already has an account" : (uErr?.message ?? "could not create login") }, 400);
  }

  const { error: pErr } = await admin.from("profiles").insert({
    id: created.user.id,
    gym_id: caller.gym_id,
    role,
    full_name,
    member_id: memberId,
  });
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    if (memberId) await admin.from("members").delete().eq("id", memberId);
    return json({ error: pErr.message }, 500);
  }

  return json({ ok: true, role, member_id: memberId, profile_id: created.user.id });
});
