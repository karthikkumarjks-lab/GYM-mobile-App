// Data layer for the test build.
//
// Today: a localStorage-backed mock so the app runs and deploys with zero backend.
// Next:  when VITE_SUPABASE_URL is set we swap the internals for real Postgres +
//        row-level security (see supabase/schema.sql). The function signatures below
//        are the contract both implementations honour, so the UI never changes.

import { buildSeed, seedGym } from "./seed";
import type {
  Checkin, Gym, Meal, Member, MemberWithSignal, Message, Plan, Session,
} from "./types";

const K = {
  gym: "mg.gym",
  members: "mg.members",
  checkins: "mg.checkins",
  plans: "mg.plans",
  messages: "mg.messages",
  meals: "mg.meals",
  session: "mg.session",
};

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}
const uid = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now();
const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function ensureSeed() {
  if (localStorage.getItem(K.gym)) return;
  const s = buildSeed();
  write(K.gym, s.gym);
  write(K.members, s.members);
  write(K.checkins, s.checkins);
  write(K.plans, s.plans);
  write(K.messages, s.messages);
  write(K.meals, s.meals);
}

// ---------- signals (shared logic, also mirrors the SQL views we'll add later) ----------
function computeSignals(members: Member[], checkins: Checkin[]): MemberWithSignal[] {
  const now = Date.now();
  const byMember = new Map<string, Checkin[]>();
  for (const c of checkins) {
    (byMember.get(c.member_id) ?? byMember.set(c.member_id, []).get(c.member_id)!).push(c);
  }
  return members.map((m) => {
    const cs = (byMember.get(m.id) ?? []).sort((a, b) => +new Date(b.at) - +new Date(a.at));
    const last = cs[0]?.at ?? null;
    const days = last ? Math.floor((now - +new Date(last)) / 86400000) : null;
    const visits30 = cs.filter((c) => now - +new Date(c.at) < 30 * 86400000).length;
    let risk: MemberWithSignal["risk"] = "ok";
    if (days === null || days >= 10) risk = "at_risk";
    else if (days >= 5) risk = "slipping";
    return { ...m, last_visit: last, days_since: days, visits_30d: visits30, risk };
  });
}

// ---------- auth (mock) ----------
export function getSession(): Session | null {
  return read<Session | null>(K.session, null);
}
async function signInOwner(fullName = "You"): Promise<Session> {
  ensureSeed();
  const g = read<Gym>(K.gym, seedGym);
  const s: Session = { role: "owner", gym_id: g.id, full_name: fullName };
  write(K.session, s);
  return s;
}
async function signInMember(memberId: string): Promise<Session> {
  ensureSeed();
  const g = read<Gym>(K.gym, seedGym);
  const m = read<Member[]>(K.members, []).find((x) => x.id === memberId);
  const s: Session = {
    role: "member",
    gym_id: g.id,
    member_id: memberId,
    full_name: m?.full_name ?? "Member",
  };
  write(K.session, s);
  return s;
}
function signOut() {
  localStorage.removeItem(K.session);
}
/** Wipe demo data back to the seed — handy while showing the app. */
function resetDemo() {
  Object.values(K).forEach((k) => localStorage.removeItem(k));
  ensureSeed();
}

// ---------- gym ----------
async function getGym(): Promise<Gym> {
  ensureSeed();
  await wait();
  return read<Gym>(K.gym, seedGym);
}
async function updateGym(patch: Partial<Gym>): Promise<Gym> {
  const g = { ...read<Gym>(K.gym, seedGym), ...patch };
  write(K.gym, g);
  return g;
}

// ---------- members ----------
async function listMembers(): Promise<Member[]> {
  ensureSeed();
  await wait();
  return read<Member[]>(K.members, []);
}
async function addMember(input: {
  full_name: string;
  phone?: string;
  plan?: string;
}): Promise<Member> {
  const g = read<Gym>(K.gym, seedGym);
  const m: Member = {
    id: uid(),
    gym_id: g.id,
    full_name: input.full_name.trim(),
    phone: input.phone?.trim() || null,
    plan: input.plan || "Monthly",
    joined_on: new Date().toISOString().slice(0, 10),
    status: "active",
  };
  write(K.members, [...read<Member[]>(K.members, []), m]);
  return m;
}
async function membersWithSignals(): Promise<MemberWithSignal[]> {
  await wait();
  return computeSignals(read<Member[]>(K.members, []), read<Checkin[]>(K.checkins, []))
    .sort((a, b) => (b.days_since ?? 999) - (a.days_since ?? 999));
}

// ---------- check-ins ----------
async function listCheckins(sinceIso?: string): Promise<Checkin[]> {
  ensureSeed();
  await wait();
  let cs = read<Checkin[]>(K.checkins, []);
  if (sinceIso) cs = cs.filter((c) => c.at >= sinceIso);
  return cs.sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
async function checkIn(memberId: string, method: Checkin["method"] = "staff"): Promise<Checkin> {
  const g = read<Gym>(K.gym, seedGym);
  const c: Checkin = {
    id: uid(),
    gym_id: g.id,
    member_id: memberId,
    at: new Date().toISOString(),
    out_at: null,
    method,
  };
  write(K.checkins, [...read<Checkin[]>(K.checkins, []), c]);
  return c;
}
async function checkOut(checkinId: string): Promise<void> {
  const cs = read<Checkin[]>(K.checkins, []).map((c) =>
    c.id === checkinId ? { ...c, out_at: new Date().toISOString() } : c
  );
  write(K.checkins, cs);
}

// ---------- win-back outbox ----------
async function listMessages(): Promise<Message[]> {
  ensureSeed();
  await wait();
  return read<Message[]>(K.messages, []).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
  );
}
function draftFor(member: MemberWithSignal, gym: Gym): { template: string; body: string } {
  const first = member.full_name.split(" ")[0];
  const d = member.days_since ?? 0;
  if (d >= 14)
    return {
      template: "day_14",
      body: `Hi ${first}, it's been a while since we saw you at ${gym.name}. Can our coach call you to reset your plan? Reply YES.`,
    };
  if (d >= 7)
    return {
      template: "day_7",
      body: `Hey ${first}, missed you at ${gym.name} this week. Want us to book your usual slot? Reply and we'll sort it.`,
    };
  return {
    template: "day_3",
    body: `Hi ${first} 👋 Everything ok? Your spot at ${gym.name} is open whenever you're back.`,
  };
}
async function queueWinback(memberId: string, body: string, template?: string): Promise<Message> {
  const g = read<Gym>(K.gym, seedGym);
  const m: Message = {
    id: uid(),
    gym_id: g.id,
    member_id: memberId,
    channel: "whatsapp",
    template: template ?? null,
    body,
    status: "simulated",
    created_at: new Date().toISOString(),
  };
  write(K.messages, [...read<Message[]>(K.messages, []), m]);
  return m;
}
/** Draft a message for every at-risk / slipping member who hasn't been messaged in 3 days. */
async function runWinbackSweep(): Promise<Message[]> {
  const gym = read<Gym>(K.gym, seedGym);
  const signals = computeSignals(read<Member[]>(K.members, []), read<Checkin[]>(K.checkins, []));
  const existing = read<Message[]>(K.messages, []);
  const recent = (mid: string) =>
    existing.some(
      (x) => x.member_id === mid && Date.now() - +new Date(x.created_at) < 3 * 86400000
    );
  const created: Message[] = [];
  for (const s of signals) {
    if (s.risk !== "at_risk" || recent(s.id)) continue;
    const { template, body } = draftFor(s, gym);
    created.push(await queueWinback(s.id, body, template));
  }
  return created;
}

// ---------- member stats ----------
export interface MemberStats {
  lastVisit: string | null;
  visits7d: number;
  visits30d: number;
  thisMonth: number;
  streakDays: number;
}
async function memberStats(memberId: string): Promise<MemberStats> {
  ensureSeed();
  await wait();
  const cs = read<Checkin[]>(K.checkins, [])
    .filter((c) => c.member_id === memberId)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // streak = consecutive days ending today or yesterday with at least one check-in
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

// ---------- member: plan + meals ----------
async function getPlan(memberId: string): Promise<Plan | null> {
  ensureSeed();
  await wait();
  return read<Plan[]>(K.plans, []).find((p) => p.member_id === memberId) ?? null;
}
async function listMeals(memberId: string): Promise<Meal[]> {
  await wait();
  return read<Meal[]>(K.meals, [])
    .filter((m) => m.member_id === memberId)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
}
async function logMeal(
  memberId: string,
  meal: Omit<Meal, "id" | "gym_id" | "member_id" | "at">
): Promise<Meal> {
  const g = read<Gym>(K.gym, seedGym);
  const row: Meal = {
    id: uid(),
    gym_id: g.id,
    member_id: memberId,
    at: new Date().toISOString(),
    ...meal,
  };
  write(K.meals, [...read<Meal[]>(K.meals, []), row]);
  return row;
}

export const db = {
  backend: import.meta.env.VITE_SUPABASE_URL ? ("supabase" as const) : ("mock" as const),
  getSession,
  signInOwner,
  signInMember,
  signOut,
  resetDemo,
  getGym,
  updateGym,
  listMembers,
  addMember,
  membersWithSignals,
  listCheckins,
  checkIn,
  checkOut,
  memberStats,
  listMessages,
  queueWinback,
  runWinbackSweep,
  getPlan,
  listMeals,
  logMeal,
};
