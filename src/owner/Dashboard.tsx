import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import type { Checkin, MemberWithSignal } from "../lib/types";
import { Avatar, Loading, Pill, Stat, clock } from "../components/ui";

export default function Dashboard() {
  const [signals, setSignals] = useState<MemberWithSignal[] | null>(null);
  const [today, setToday] = useState<Checkin[]>([]);

  useEffect(() => {
    db.membersWithSignals().then(setSignals);
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    db.listCheckins(midnight.toISOString()).then(setToday);
  }, []);

  if (!signals) return <Loading />;

  const active = signals.filter((s) => s.status === "active").length;
  const atRisk = signals.filter((s) => s.risk === "at_risk").length;
  const inNow = today.filter((c) => !c.out_at).length;
  const nameOf = (id: string) => signals.find((s) => s.id === id)?.full_name ?? "Member";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold">Today</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat value={today.length} label="check-ins today" />
        <Stat value={inNow} label="in the gym now" />
        <Stat value={active} label="active members" />
        <Stat value={atRisk} label="going quiet" tone="text-warn" />
      </div>

      {atRisk > 0 && (
        <Link to="/owner/winback" className="card p-4 bg-warn-soft border-[#F0DFBE] flex items-center justify-between">
          <div>
            <div className="font-bold text-warn">{atRisk} members haven't been in for 10+ days</div>
            <div className="text-xs text-muted mt-0.5">Open the win-back radar →</div>
          </div>
          <div className="text-2xl font-extrabold text-warn">{atRisk}</div>
        </Link>
      )}

      <div>
        <div className="eyebrow mb-2">Recent check-ins</div>
        <div className="card divide-y divide-line">
          {today.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">
              No check-ins yet today. Mark one from the Members tab.
            </div>
          )}
          {today.slice(0, 8).map((c) => (
            <div key={c.id} className="px-4 py-3 flex items-center gap-3">
              <Avatar name={nameOf(c.member_id)} tone={c.out_at ? "acc" : "pos"} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{nameOf(c.member_id)}</div>
                <div className="text-xs text-muted capitalize">{c.method}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">{clock(c.at)}</div>
                <div className="text-xs text-muted">{c.out_at ? "left" : "in"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Slipping — no visit in 5–9 days</div>
        <div className="card divide-y divide-line">
          {signals.filter((s) => s.risk === "slipping").slice(0, 6).map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-3">
              <Avatar name={s.full_name} tone="warn" />
              <div className="flex-1">
                <div className="text-sm font-bold">{s.full_name}</div>
                <div className="text-xs text-muted">last in {s.days_since} days ago · {s.visits_30d} visits this month</div>
              </div>
              <Pill tone="warn">watch</Pill>
            </div>
          ))}
          {signals.filter((s) => s.risk === "slipping").length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">Nobody's slipping right now.</div>
          )}
        </div>
      </div>
    </div>
  );
}
