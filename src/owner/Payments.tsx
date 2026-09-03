import { useEffect, useState } from "react";
import { db } from "../lib/db";
import type { Member, Payment } from "../lib/types";
import { Avatar, Loading, Pill, timeAgo } from "../components/ui";

export default function Payments() {
  const [rows, setRows] = useState<Payment[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({ member_id: "", amount: "1500", purpose: "Monthly fee" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string | null; configured: boolean } | null>(null);

  const load = () => db.listPayments().then(setRows);
  useEffect(() => {
    load();
    db.listMembers().then(setMembers);
  }, []);

  if (!rows) return <Loading />;
  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.full_name ?? "—";

  async function collect(e: React.FormEvent) {
    e.preventDefault();
    const paise = Math.round(Number(form.amount) * 100);
    if (paise < 100) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await db.collectFee({
        member_id: form.member_id || null,
        amount_paise: paise,
        purpose: form.purpose,
      });
      setResult({ url: r.payment.link_url, configured: r.configured });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold">Payments</h2>

      <form onSubmit={collect} className="card p-4 flex flex-col gap-3">
        <div className="eyebrow">Collect a fee</div>
        <select
          className="field"
          value={form.member_id}
          onChange={(e) => setForm({ ...form, member_id: e.target.value })}
        >
          <option value="">— member (optional) —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
        <div className="flex gap-3">
          <input
            className="field"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d]/g, "") })}
            placeholder="Amount ₹"
          />
          <input
            className="field"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="Purpose"
          />
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Create payment link"}
        </button>
        {result && (
          <div className="text-sm">
            {result.configured ? (
              <>
                Live Razorpay link:{" "}
                <a className="text-accent font-semibold underline" href={result.url ?? "#"} target="_blank" rel="noreferrer">
                  {result.url}
                </a>
              </>
            ) : (
              <span className="text-muted">
                Simulated link created — add <code>RAZORPAY_KEY_ID</code> / <code>RAZORPAY_KEY_SECRET</code> in Supabase to make it real.
              </span>
            )}
          </div>
        )}
      </form>

      <div>
        <div className="eyebrow mb-2">Recent</div>
        <div className="card divide-y divide-line">
          {rows.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <Avatar name={nameOf(p.member_id) === "—" ? "G" : nameOf(p.member_id)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{nameOf(p.member_id)}</div>
                <div className="text-xs text-muted">
                  {p.purpose} · {timeAgo(p.created_at)}
                </div>
              </div>
              <div className="text-sm font-extrabold">₹{(p.amount_paise / 100).toLocaleString("en-IN")}</div>
              <Pill tone={p.status === "paid" ? "pos" : p.status === "simulated" ? "mut" : "acc"}>{p.status}</Pill>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">No payments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
