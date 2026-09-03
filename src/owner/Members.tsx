import { useEffect, useState } from "react";
import { db } from "../lib/db";
import type { MemberWithSignal } from "../lib/types";
import { Avatar, Loading, Pill, timeAgo } from "../components/ui";

export default function Members() {
  const [rows, setRows] = useState<MemberWithSignal[] | null>(null);
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", plan: "Monthly" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    db.membersWithSignals().then((r) =>
      setRows(r.sort((a, b) => a.full_name.localeCompare(b.full_name)))
    );
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) return <Loading />;

  const filtered = rows.filter((r) => r.full_name.toLowerCase().includes(q.toLowerCase()));

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    await db.addMember(form);
    setForm({ full_name: "", phone: "", plan: "Monthly" });
    setAdding(false);
    await load();
  }

  async function check(id: string) {
    setBusy(id);
    await db.checkIn(id, "staff");
    await load();
    setBusy(null);
  }

  const riskPill = (r: MemberWithSignal["risk"]) =>
    r === "at_risk" ? <Pill tone="warn">at risk</Pill> : r === "slipping" ? <Pill tone="mut">slipping</Pill> : <Pill tone="pos">active</Pill>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold flex-1">Members ({rows.length})</h2>
        <button className="btn-ghost" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cancel" : "Add member"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addMember} className="card p-4 flex flex-col gap-3">
          <input
            className="field"
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            autoFocus
          />
          <div className="flex gap-3">
            <input
              className="field"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <select className="field" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              {["Monthly", "Quarterly", "Half-yearly", "Annual"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <button className="btn">Add to Iron House Gym</button>
        </form>
      )}

      <input
        className="field"
        placeholder="Search members"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="card divide-y divide-line">
        {filtered.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-center gap-3">
            <Avatar name={m.full_name} tone={m.risk === "at_risk" ? "warn" : "acc"} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{m.full_name}</div>
              <div className="text-xs text-muted">
                {m.plan} · last in {timeAgo(m.last_visit)}
              </div>
            </div>
            {riskPill(m.risk)}
            <button
              className="btn py-2 px-3 text-xs"
              disabled={busy === m.id}
              onClick={() => check(m.id)}
            >
              {busy === m.id ? "…" : "Check in"}
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No matches.</div>}
      </div>
    </div>
  );
}
