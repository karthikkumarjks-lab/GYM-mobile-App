import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { PLAN_FEE_FIELD, PLAN_LABELS, type Gym, type Member, type Payment } from "../lib/types";
import { Avatar, Loading, Pill, timeAgo } from "../components/ui";

const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
const feeOf = (gym: Gym, plan: string) => Number(gym[PLAN_FEE_FIELD[plan] ?? "fee_monthly_paise"]) || 0;

export default function Payments() {
  const [gym, setGym] = useState<Gym | null>(null);
  const [rows, setRows] = useState<Payment[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [plan, setPlan] = useState<string>("Monthly");
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ url: string | null; configured: boolean } | null>(null);

  // editable fee schedule
  const [fees, setFees] = useState<Record<string, string>>({});
  const [feesSaved, setFeesSaved] = useState(false);

  const load = () => db.listPayments().then(setRows);
  useEffect(() => {
    db.getGym().then((g) => {
      setGym(g);
      setFees({
        Monthly: String(g.fee_monthly_paise / 100),
        Quarterly: String(g.fee_quarterly_paise / 100),
        "Half-yearly": String(g.fee_half_paise / 100),
        Annual: String(g.fee_annual_paise / 100),
      });
    });
    load();
    db.listMembers().then(setMembers);
  }, []);

  if (!rows || !gym) return <Loading />;
  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.full_name ?? "—";
  const amount = feeOf(gym, plan);

  function pickMember(id: string) {
    setMemberId(id);
    const m = members.find((x) => x.id === id);
    if (m?.plan && PLAN_FEE_FIELD[m.plan]) setPlan(m.plan);
  }

  const MULT: Record<string, number> = { Quarterly: 3, "Half-yearly": 6, Annual: 12 };

  function setFee(label: string, raw: string) {
    const val = raw.replace(/[^\d]/g, "");
    if (label === "Monthly") {
      // typing the monthly fee fills the longer tiers at plain multiples;
      // the owner can still tweak any tier afterwards
      const m = Number(val) || 0;
      setFees({
        Monthly: val,
        Quarterly: m ? String(m * 3) : "",
        "Half-yearly": m ? String(m * 6) : "",
        Annual: m ? String(m * 12) : "",
      });
    } else {
      setFees({ ...fees, [label]: val });
    }
  }

  async function saveFees() {
    const patch: Partial<Gym> = {
      fee_monthly_paise: Math.round(Number(fees.Monthly) * 100),
      fee_quarterly_paise: Math.round(Number(fees.Quarterly) * 100),
      fee_half_paise: Math.round(Number(fees["Half-yearly"]) * 100),
      fee_annual_paise: Math.round(Number(fees.Annual) * 100),
    };
    setGym(await db.updateGym(patch));
    setFeesSaved(true);
    setTimeout(() => setFeesSaved(false), 1500);
  }

  async function collect(e: React.FormEvent) {
    e.preventDefault();
    if (amount < 100) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await db.collectFee({
        member_id: memberId || null,
        amount_paise: amount,
        purpose: `${plan} fee`,
      });
      setResult({ url: r.payment.link_url, configured: r.configured });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h2 className="text-xl font-extrabold">Payments</h2>

      {/* fee schedule */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="eyebrow">
          Membership fees {feesSaved && <span className="text-pos"> · saved</span>}
        </div>
        <p className="text-xs text-muted -mt-1">
          Set the monthly fee and the others fill in at 3× / 6× / 12×. Adjust any tier to give a discount.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {PLAN_LABELS.map((p) => (
            <label key={p} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted">
                {p}{MULT[p] ? <span className="text-muted/60"> · {MULT[p]}×</span> : null}
              </span>
              <div className="flex items-center gap-1 field !py-2">
                <span className="text-muted text-sm">₹</span>
                <input
                  className="w-full outline-none bg-transparent text-sm font-bold"
                  inputMode="numeric"
                  value={fees[p] ?? ""}
                  onChange={(e) => setFee(p, e.target.value)}
                  onBlur={saveFees}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* collect a fee */}
      <form onSubmit={collect} className="card p-4 flex flex-col gap-3">
        <div className="eyebrow">Collect a fee</div>
        <select className="field" value={memberId} onChange={(e) => pickMember(e.target.value)}>
          <option value="">— member (optional) —</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {PLAN_LABELS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`flex-1 rounded-xl py-2 text-xs font-bold border ${
                plan === p ? "bg-accent text-white border-accent" : "bg-card text-muted border-line"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted">
          {plan} fee · <span className="font-extrabold text-ink">{rupees(amount)}</span>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : `Create payment link · ${rupees(amount)}`}
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
              <div className="text-sm font-extrabold">{rupees(p.amount_paise)}</div>
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
