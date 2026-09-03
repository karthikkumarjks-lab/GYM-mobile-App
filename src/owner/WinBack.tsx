import { useEffect, useState } from "react";
import { db } from "../lib/db";
import type { Message, MemberWithSignal } from "../lib/types";
import { Avatar, Loading, Pill, timeAgo } from "../components/ui";

export default function WinBack() {
  const [signals, setSignals] = useState<MemberWithSignal[] | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setSignals(await db.membersWithSignals());
    setMsgs(await db.listMessages());
  };
  useEffect(() => {
    load();
  }, []);

  if (!signals) return <Loading />;

  const atRisk = signals.filter((s) => s.risk === "at_risk");
  const nameOf = (id: string) => signals.find((s) => s.id === id)?.full_name ?? "Member";
  const messaged = (id: string) =>
    msgs.some((m) => m.member_id === id && Date.now() - +new Date(m.created_at) < 3 * 86400000);

  async function sweep() {
    setBusy(true);
    const made = await db.runWinbackSweep();
    await load();
    setBusy(false);
    setToast(
      made.length
        ? `${made.length} WhatsApp message${made.length > 1 ? "s" : ""} drafted (simulated — nothing was actually sent).`
        : "Everyone at risk was already messaged in the last 3 days."
    );
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold flex-1">Win-back radar</h2>
        <button className="btn" onClick={sweep} disabled={busy}>
          {busy ? "Working…" : "Run win-back now"}
        </button>
      </div>
      {toast && (
        <div className="card p-3 bg-pos-soft border-pos/30 text-sm font-semibold text-pos">{toast}</div>
      )}
      <p className="text-sm text-muted">
        Members with no visit in 10+ days. The sweep drafts a WhatsApp message for each one
        who hasn't been contacted recently. In this test build messages are{" "}
        <b>simulated</b> — they show in the outbox below but are not actually sent.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5">
          <div className="text-2xl font-extrabold text-warn">{atRisk.length}</div>
          <div className="text-[11px] font-semibold text-muted mt-0.5">at risk now</div>
        </div>
        <div className="card p-3.5">
          <div className="text-2xl font-extrabold">{msgs.length}</div>
          <div className="text-[11px] font-semibold text-muted mt-0.5">messages sent</div>
        </div>
        <div className="card p-3.5">
          <div className="text-2xl font-extrabold text-pos">
            {signals.filter((s) => s.risk === "ok" && messaged(s.id)).length}
          </div>
          <div className="text-[11px] font-semibold text-muted mt-0.5">back after a nudge</div>
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">At risk</div>
        <div className="card divide-y divide-line">
          {atRisk.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-3">
              <Avatar name={s.full_name} tone="warn" />
              <div className="flex-1">
                <div className="text-sm font-bold">{s.full_name}</div>
                <div className="text-xs text-muted">
                  {s.days_since} days away · was {s.visits_30d ? `${s.visits_30d}×/mo` : "regular"}
                </div>
              </div>
              {messaged(s.id) ? <Pill tone="acc">messaged</Pill> : <Pill tone="warn">needs a nudge</Pill>}
            </div>
          ))}
          {atRisk.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">Nobody's at risk right now. 🎉</div>
          )}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Outbox — simulated WhatsApp</div>
        <div className="flex flex-col gap-2">
          {msgs.slice(0, 12).map((m) => (
            <div key={m.id} className="card p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold">{nameOf(m.member_id)}</span>
                <span className="text-xs text-muted">{timeAgo(m.created_at)}</span>
                <span className="flex-1" />
                <Pill tone="mut">{m.template}</Pill>
                <Pill tone="pos">simulated</Pill>
              </div>
              <div className="text-sm bg-paper rounded-lg rounded-tl-sm px-3 py-2">{m.body}</div>
            </div>
          ))}
          {msgs.length === 0 && (
            <div className="card p-6 text-center text-sm text-muted">
              No messages yet. Hit “Run win-back now”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
