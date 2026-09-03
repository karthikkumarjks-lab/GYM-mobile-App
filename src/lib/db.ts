// Data layer.
//
// - No Supabase env vars  -> localStorage mock (zero backend, for local play).
// - VITE_SUPABASE_URL set  -> real Postgres + row-level security (supabase/schema.sql).
//
// Both implementations honour the same `db` contract so the UI never changes.

import { buildSeed, seedGym } from "./seed";
import { hasSupabase, supabase } from "./supabase";
import type {
  Checkin, Gym, Meal, Member, MemberWithSignal, Message, Payment, Plan, Session,
} from "./types";

export interface MealEstimate {
  configured: boolean;
  label?: string;
  kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  error?: string;
}
export interface FeeInput {
  member_id?: string | null;
  amount_paise: number;
  purpose?: string;
}

// ---------- shared pure logic ----------
function signalsFrom(members: Member[], checkins: Checkin[]): MemberWithSignal[] {
  const now = Date.now();
  const byMember = new Map<string, Checkin[]>();
  for (const c of checkins) {
    const arr = byMember.get(c.member_id) ?? [];
    arr.push(c);
    byMember.set(c.member_id, arr);
  }
  return members
    .map((m) => {
      const cs = (byMember.get(m.id) ?? []).sort((a, b) => +new Date(b.at) - +new Date(a.at));
      const last = cs[0]?.at ?? null;
      const days = last ? Math.floor((now - +new Date(last)) / 86400000) : null;
      const visits30 = cs.filter((c) => now - +new Date(c.at) < 30 * 86400000).length;
      let risk: MemberWithSignal["risk"] = "ok";
      if (days === null || days >= 10) risk = "at_risk";
      else if (days >= 5) risk = "slipping";
      return { ...m, last_visit: last, days_since: days, visits_30d: visits30, risk };
    })
    .sort((a, b) => (b.days_since ?? 999) - (a.days_since ?? 999));
}

export interface MemberStats {
  lastVisit: string | null;
  visits7d: number;
  visits30d: number;
  thisMonth: number;
  streakDays: number;
}
function statsFrom(checkins: Checkin[]): MemberStats {
  const cs = [...checkins].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const days = new Set(cs.map((c) => new Date(c.at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    lastVisit: cs[0]?.at ?? null,
    visits7d: cs.filter((c) => now - +new Date(c.at) < 7 * 86400000).length,
    visits30d: cs.filter((c) => now - +new Date(c.at) < 30 * 86400000).length,
    thisMonth: cs.filter((c) => +new Date(c.at) >= +monthStart).length,
    streakDays: streak,
  };
}

function draftFor(member: MemberWithSignal, gym: Gym): { template: string; body: string } {
  const first = member.full_name.split(" ")[0];
  const d = member.days_since ?? 0;
  if (d >= 14)
    return { template: "day_14", body: `Hi ${first}, it's been a while since we saw you at ${gym.name}. Can our coach call you to reset your plan? Reply YES.` };
  if (d >= 7)
    return { template: "day_7", body: `Hey ${first}, missed you at ${gym.name} this week. Want us to book your usual slot? Reply and we'll sort it.` };
  return { template: "day_3", body: `Hi ${first} 👋 Everything ok? Your spot at ${gym.name} is open whenever you're back.` };
}

// ---------- session cache (shared) ----------
const SKEY = "mg.session";
export function getSession(): Session | null {
  try {
    const v = localStorage.getItem(SKEY);
    return v ? (JSON.parse(v) as Session) : null;
  } catch {
    return null;
  }
}
function setSession(s: Session | null) {
  if (s) localStorage.setItem(SKEY, JSON.stringify(s));
  else localStorage.removeItem(SKEY);
}
function requireGymId(): string {
  const s = getSession();
  if (!s) throw new Error("Not signed in");
  return s.gym_id;
}

/* ============================================================ MOCK ========= */
const K = {
  gym: "mg.gym", members: "mg.members", checkins: "mg.checkins",
  plans: "mg.plans", messages: "mg.messages", meals: "mg.meals",
};
function rd<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function wr<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}
const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now();
const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));

function ensureSeed() {
  if (localStorage.getItem(K.gym)) return;
  const s = buildSeed();
  wr(K.gym, s.gym);
  wr(K.members, s.members);
  wr(K.checkins, s.checkins);
  wr(K.plans, s.plans);
  wr(K.messages, s.messages);
  wr(K.meals, s.meals);
}

const mockDb = {
  async bootstrap() {
    ensureSeed();
    return getSession();
  },
  onAuthChange(_cb: (s: Session | null) => void) {
    return () => {};
  },
  async demoLogin(who: string) {
    ensureSeed();
    const g = rd<Gym>(K.gym, seedGym);
    if (who === "owner") {
      setSession({ role: "owner", gym_id: g.id, full_name: "Gym owner" });
    } else {
      const m = rd<Member[]>(K.members, []).find((x) => x.full_name.split(" ")[0].toLowerCase() === who.toLowerCase());
      if (!m) throw new Error("Unknown demo member");
      setSession({ role: "member", gym_id: g.id, member_id: m.id, full_name: m.full_name });
    }
    return getSession()!;
  },
  async signOut() {
    setSession(null);
  },
  resetDemo() {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    setSession(null);
    ensureSeed();
  },
  async getGym(): Promise<Gym> {
    ensureSeed();
    await wait();
    return rd<Gym>(K.gym, seedGym);
  },
  async updateGym(patch: Partial<Gym>): Promise<Gym> {
    const g = { ...rd<Gym>(K.gym, seedGym), ...patch };
    wr(K.gym, g);
    return g;
  },
  async listMembers(): Promise<Member[]> {
    ensureSeed();
    await wait();
    return rd<Member[]>(K.members, []);
  },
  async addMember(input: { full_name: string; phone?: string; plan?: string }): Promise<Member> {
    const g = rd<Gym>(K.gym, seedGym);
    const m: Member = {
      id: uid(), gym_id: g.id, full_name: input.full_name.trim(),
      phone: input.phone?.trim() || null, plan: input.plan || "Monthly",
      joined_on: new Date().toISOString().slice(0, 10), status: "active",
    };
    wr(K.members, [...rd<Member[]>(K.members, []), m]);
    return m;
  },
  async membersWithSignals(): Promise<MemberWithSignal[]> {
    await wait();
    return signalsFrom(rd<Member[]>(K.members, []), rd<Checkin[]>(K.checkins, []));
  },
  async listCheckins(sinceIso?: string): Promise<Checkin[]> {
    ensureSeed();
    await wait();
    let cs = rd<Checkin[]>(K.checkins, []);
    if (sinceIso) cs = cs.filter((c) => c.at >= sinceIso);
    return cs.sort((a, b) => +new Date(b.at) - +new Date(a.at));
  },
  async checkIn(memberId: string, method: Checkin["method"] = "staff"): Promise<Checkin> {
    const g = rd<Gym>(K.gym, seedGym);
    const c: Checkin = { id: uid(), gym_id: g.id, member_id: memberId, at: new Date().toISOString(), out_at: null, method };
    wr(K.checkins, [...rd<Checkin[]>(K.checkins, []), c]);
    return c;
  },
  async checkOut(checkinId: string): Promise<void> {
    wr(K.checkins, rd<Checkin[]>(K.checkins, []).map((c) => (c.id === checkinId ? { ...c, out_at: new Date().toISOString() } : c)));
  },
  async memberStats(memberId: string): Promise<MemberStats> {
    ensureSeed();
    await wait();
    return statsFrom(rd<Checkin[]>(K.checkins, []).filter((c) => c.member_id === memberId));
  },
  async listMessages(): Promise<Message[]> {
    ensureSeed();
    await wait();
    return rd<Message[]>(K.messages, []).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },
  async queueWinback(memberId: string, body: string, template?: string): Promise<Message> {
    const g = rd<Gym>(K.gym, seedGym);
    const m: Message = { id: uid(), gym_id: g.id, member_id: memberId, channel: "whatsapp", template: template ?? null, body, status: "simulated", created_at: new Date().toISOString() };
    wr(K.messages, [...rd<Message[]>(K.messages, []), m]);
    return m;
  },
  async runWinbackSweep(): Promise<Message[]> {
    const gym = rd<Gym>(K.gym, seedGym);
    const signals = signalsFrom(rd<Member[]>(K.members, []), rd<Checkin[]>(K.checkins, []));
    const existing = rd<Message[]>(K.messages, []);
    const recent = (mid: string) => existing.some((x) => x.member_id === mid && Date.now() - +new Date(x.created_at) < 3 * 86400000);
    const created: Message[] = [];
    for (const s of signals) {
      if (s.risk !== "at_risk" || recent(s.id)) continue;
      const { template, body } = draftFor(s, gym);
      created.push(await mockDb.queueWinback(s.id, body, template));
    }
    return created;
  },
  async getPlan(memberId: string): Promise<Plan | null> {
    ensureSeed();
    await wait();
    return rd<Plan[]>(K.plans, []).find((p) => p.member_id === memberId) ?? null;
  },
  async listMeals(memberId: string): Promise<Meal[]> {
    await wait();
    return rd<Meal[]>(K.meals, []).filter((m) => m.member_id === memberId).sort((a, b) => +new Date(b.at) - +new Date(a.at));
  },
  async logMeal(memberId: string, meal: Omit<Meal, "id" | "gym_id" | "member_id" | "at">): Promise<Meal> {
    const g = rd<Gym>(K.gym, seedGym);
    const row: Meal = { id: uid(), gym_id: g.id, member_id: memberId, at: new Date().toISOString(), ...meal };
    wr(K.meals, [...rd<Meal[]>(K.meals, []), row]);
    return row;
  },
  async scanMeal(_image: string): Promise<MealEstimate> {
    return { configured: false };
  },
  async listPayments(): Promise<Payment[]> {
    return rd<Payment[]>("mg.payments", []).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },
  async collectFee(input: FeeInput): Promise<{ configured: boolean; payment: Payment }> {
    const g = rd<Gym>(K.gym, seedGym);
    const row: Payment = {
      id: uid(), gym_id: g.id, member_id: input.member_id ?? null,
      amount_paise: input.amount_paise, purpose: input.purpose ?? "Gym fee",
      provider: "razorpay", provider_ref: null, status: "simulated",
      link_url: "https://rzp.io/demo/" + uid().slice(0, 8), created_at: new Date().toISOString(),
    };
    wr("mg.payments", [...rd<Payment[]>("mg.payments", []), row]);
    return { configured: false, payment: row };
  },
};

/* ========================================================= SUPABASE ======== */
const DEMO_PASSWORD = "ironhouse";
const demoEmail = (who: string) =>
  who === "owner" ? "owner@ironhouse.test" : `${who.toLowerCase()}@ironhouse.test`;

async function profileToSession(): Promise<Session | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: p } = await supabase
    .from("profiles")
    .select("role, gym_id, member_id, full_name")
    .eq("id", auth.user.id)
    .single();
  if (!p || !p.gym_id) return null;
  const s: Session = { role: p.role, gym_id: p.gym_id, member_id: p.member_id, full_name: p.full_name ?? "" };
  setSession(s);
  return s;
}

const supaDb = {
  async bootstrap() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setSession(null);
      return null;
    }
    return profileToSession();
  },
  onAuthChange(cb: (s: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        cb(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        cb(await profileToSession());
      }
    });
    return () => data.subscription.unsubscribe();
  },
  async demoLogin(who: string): Promise<Session> {
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail(who),
      password: DEMO_PASSWORD,
    });
    if (error) throw error;
    const s = await profileToSession();
    if (!s) throw new Error("No profile for this account");
    return s;
  },
  async signOut() {
    await supabase.auth.signOut();
    setSession(null);
  },
  resetDemo() {
    // no-op for the hosted demo
  },
  async getGym(): Promise<Gym> {
    const { data, error } = await supabase.from("gyms").select("*").eq("id", requireGymId()).single();
    if (error) throw error;
    return data as Gym;
  },
  async updateGym(patch: Partial<Gym>): Promise<Gym> {
    const { data, error } = await supabase.from("gyms").update(patch).eq("id", requireGymId()).select().single();
    if (error) throw error;
    return data as Gym;
  },
  async listMembers(): Promise<Member[]> {
    const { data, error } = await supabase.from("members").select("*").eq("gym_id", requireGymId()).order("full_name");
    if (error) throw error;
    return data as Member[];
  },
  async addMember(input: { full_name: string; phone?: string; plan?: string }): Promise<Member> {
    const { data, error } = await supabase
      .from("members")
      .insert({ gym_id: requireGymId(), full_name: input.full_name.trim(), phone: input.phone?.trim() || null, plan: input.plan || "Monthly" })
      .select()
      .single();
    if (error) throw error;
    return data as Member;
  },
  async membersWithSignals(): Promise<MemberWithSignal[]> {
    const gid = requireGymId();
    const [{ data: m }, { data: c }] = await Promise.all([
      supabase.from("members").select("*").eq("gym_id", gid),
      supabase.from("checkins").select("*").eq("gym_id", gid).gte("at", new Date(Date.now() - 45 * 86400000).toISOString()),
    ]);
    return signalsFrom((m ?? []) as Member[], (c ?? []) as Checkin[]);
  },
  async listCheckins(sinceIso?: string): Promise<Checkin[]> {
    let q = supabase.from("checkins").select("*").eq("gym_id", requireGymId()).order("at", { ascending: false });
    if (sinceIso) q = q.gte("at", sinceIso);
    const { data, error } = await q;
    if (error) throw error;
    return data as Checkin[];
  },
  async checkIn(memberId: string, method: Checkin["method"] = "staff"): Promise<Checkin> {
    const { data, error } = await supabase
      .from("checkins")
      .insert({ gym_id: requireGymId(), member_id: memberId, method })
      .select()
      .single();
    if (error) throw error;
    return data as Checkin;
  },
  async checkOut(checkinId: string): Promise<void> {
    const { error } = await supabase.from("checkins").update({ out_at: new Date().toISOString() }).eq("id", checkinId);
    if (error) throw error;
  },
  async memberStats(memberId: string): Promise<MemberStats> {
    const { data } = await supabase
      .from("checkins")
      .select("at")
      .eq("member_id", memberId)
      .gte("at", new Date(Date.now() - 60 * 86400000).toISOString());
    return statsFrom((data ?? []) as Checkin[]);
  },
  async listMessages(): Promise<Message[]> {
    const { data, error } = await supabase.from("messages").select("*").eq("gym_id", requireGymId()).order("created_at", { ascending: false });
    if (error) throw error;
    return data as Message[];
  },
  async queueWinback(memberId: string, body: string, template?: string): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({ gym_id: requireGymId(), member_id: memberId, body, template: template ?? null, channel: "whatsapp", status: "simulated" })
      .select()
      .single();
    if (error) throw error;
    return data as Message;
  },
  async runWinbackSweep(): Promise<Message[]> {
    const gym = await supaDb.getGym();
    const signals = await supaDb.membersWithSignals();
    const existing = await supaDb.listMessages();
    const recent = (mid: string) => existing.some((x) => x.member_id === mid && Date.now() - +new Date(x.created_at) < 3 * 86400000);
    const created: Message[] = [];
    for (const s of signals) {
      if (s.risk !== "at_risk" || recent(s.id)) continue;
      const { template, body } = draftFor(s, gym);
      const msg = await supaDb.queueWinback(s.id, body, template);
      // Try to actually send if WhatsApp is connected. Fake demo phone numbers will
      // just come back not-ok, so the message stays "simulated" — which is correct.
      if (s.phone) {
        try {
          const { data } = await supabase.functions.invoke("whatsapp-send", { body: { to: s.phone, body } });
          if ((data as { ok?: boolean })?.ok) {
            await supabase.from("messages").update({ status: "sent" }).eq("id", msg.id);
            msg.status = "sent";
          }
        } catch { /* keep simulated */ }
      }
      created.push(msg);
    }
    return created;
  },
  async getPlan(memberId: string): Promise<Plan | null> {
    const { data } = await supabase.from("plans").select("*").eq("member_id", memberId).limit(1);
    return (data?.[0] as Plan) ?? null;
  },
  async listMeals(memberId: string): Promise<Meal[]> {
    const { data } = await supabase.from("meals").select("*").eq("member_id", memberId).order("at", { ascending: false });
    return (data ?? []) as Meal[];
  },
  async logMeal(memberId: string, meal: Omit<Meal, "id" | "gym_id" | "member_id" | "at">): Promise<Meal> {
    const { data, error } = await supabase
      .from("meals")
      .insert({ gym_id: requireGymId(), member_id: memberId, ...meal })
      .select()
      .single();
    if (error) throw error;
    return data as Meal;
  },
  async scanMeal(image: string): Promise<MealEstimate> {
    const { data, error } = await supabase.functions.invoke("meal-scan", { body: { image } });
    if (error || !data) return { configured: false, error: error?.message };
    return data as MealEstimate;
  },
  async listPayments(): Promise<Payment[]> {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("gym_id", requireGymId())
      .order("created_at", { ascending: false });
    return (data ?? []) as Payment[];
  },
  async collectFee(input: FeeInput): Promise<{ configured: boolean; payment: Payment }> {
    const { data, error } = await supabase.functions.invoke("razorpay-link", { body: input });
    if (error) throw error;
    return data as { configured: boolean; payment: Payment };
  },
};

export const db = {
  backend: hasSupabase ? ("supabase" as const) : ("mock" as const),
  getSession,
  ...(hasSupabase ? supaDb : mockDb),
};
