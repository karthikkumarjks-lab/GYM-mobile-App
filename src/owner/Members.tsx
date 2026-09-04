import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { ADDABLE_ROLES, ROLE_LABEL, type MemberWithSignal, type TeamMember } from "../lib/types";
import { Avatar, Loading, Pill, timeAgo } from "../components/ui";

const PLANS = ["Monthly", "Quarterly", "Half-yearly", "Annual"];
const blank = { full_name: "", email: "", password: "", role: "member", phone: "", plan: "Monthly" };

export default function Members() {
  const [rows, setRows] = useState<MemberWithSignal[] | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState<string | null>(null);
  const [addErr, setAddErr] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  const load = async () => {
    const [m, t] = await Promise.all([db.membersWithSignals(), db.listTeam()]);
    setRows(m.sort((a, b) => a.full_name.localeCompare(b.full_name)));
    setTeam(t);
  };
  useEffect(() => {
    void load();
  }, []);

  if (!rows) return <Loading />;
  const filtered = rows.filter((r) => r.full_name.toLowerCase().includes(q.toLowerCase()));

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      setAddErr("Full name, email, and a password of at least 6 characters are required.");
      return;
    }
    setAddBusy(true);
    setAddErr(null);
    try {
      await db.addMember(form);
      setForm(blank);
      setAdding(false);
      await load();
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : "Could not add");
    }
    setAddBusy(false);
  }

  async function check(id: string) {
    setBusy(id);
    await db.checkIn(id, "staff");
    await load();
    setBusy(null);
  }

  async function removeMember(name: string, ref: { member_id?: string; profile_id?: string }) {
    if (!confirm(`Remove ${name}? This deletes their login and history.`)) return;
    setBusy(ref.member_id ?? ref.profile_id ?? "");
    try {
      await db.removeMember(ref);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not remove");
    }
    setBusy(null);
  }

  const riskPill = (r: MemberWithSignal["risk"]) =>
    r === "at_risk" ? <Pill tone="warn">at risk</Pill> : r === "slipping" ? <Pill tone="mut">slipping</Pill> : <Pill tone="pos">active</Pill>;

  const staff = team.filter((t) => t.role !== "member" && t.role !== "owner");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold flex-1">People</h2>
        <button className="btn-ghost" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cancel" : "Add person"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addMember} className="card p-4 flex flex-col gap-3">
          <p className="text-xs text-muted">
            This creates their login. Give them the email and password you set here.
          </p>
          {addErr && <div className="text-sm text-accent font-semibold">{addErr}</div>}
          <input className="field" placeholder="Full name" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} autoFocus />
          <input className="field" type="email" placeholder="Login email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field" placeholder="Temporary password (6+ chars)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="flex gap-3">
            <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ADDABLE_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {form.role === "member" && (
              <select className="field" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                {PLANS.map((p) => <option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <input className="field" placeholder="Phone (optional)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="btn" disabled={addBusy}>
            {addBusy ? "Creating…" : `Add ${ROLE_LABEL[form.role].toLowerCase()} + create login`}
          </button>
        </form>
      )}

      {staff.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Team ({staff.length + 1})</div>
          <div className="card divide-y divide-line">
            <div className="px-4 py-3 flex items-center gap-3">
              <Avatar name="Gym owner" tone="acc" />
              <div className="flex-1 text-sm font-bold">You</div>
              <Pill tone="acc">Owner</Pill>
            </div>
            {staff.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                <Avatar name={t.full_name} tone="acc" />
                <div className="flex-1 min-w-0 text-sm font-bold truncate">{t.full_name}</div>
                <Pill tone="acc">{ROLE_LABEL[t.role]}</Pill>
                <button className="text-xs text-accent underline"
                  disabled={busy === t.id}
                  onClick={() => removeMember(t.full_name, { profile_id: t.id })}>
                  remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="eyebrow mb-1">Members ({rows.length})</div>
      <input className="field" placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="card divide-y divide-line">
        {filtered.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-center gap-2.5">
            <Avatar name={m.full_name} tone={m.risk === "at_risk" ? "warn" : "acc"} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{m.full_name}</div>
              <div className="text-xs text-muted">{m.plan} · last in {timeAgo(m.last_visit)}</div>
            </div>
            {riskPill(m.risk)}
            <button className="btn py-2 px-3 text-xs" disabled={busy === m.id} onClick={() => check(m.id)}>
              {busy === m.id ? "…" : "Check in"}
            </button>
            <button className="text-xs text-accent underline" disabled={busy === m.id}
              onClick={() => removeMember(m.full_name, { member_id: m.id })}>
              remove
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No matches.</div>}
      </div>
    </div>
  );
}
