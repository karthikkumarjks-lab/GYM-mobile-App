import { useEffect, useState } from "react";
import { db, type MemberStats } from "../lib/db";
import type { Session } from "../lib/types";
import { Loading, clock, plural, timeAgo } from "../components/ui";

export default function CheckIn({ session }: { session: Session }) {
  const mid = session.member_id!;
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [justIn, setJustIn] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => db.memberStats(mid).then(setStats);
  useEffect(() => {
    load();
  }, [mid]);

  async function go() {
    setBusy(true);
    const c = await db.checkIn(mid, "qr");
    setJustIn(c.at);
    await load();
    setBusy(false);
  }

  if (!stats) return <Loading />;

  return (
    <div className="flex flex-col gap-5 pt-2 items-center text-center">
      {justIn ? (
        <>
          <div className="h-28 w-28 rounded-full grid place-items-center text-white text-4xl bg-accent">✓</div>
          <div>
            <div className="text-xl font-extrabold">Checked in</div>
            <div className="text-sm text-muted mt-0.5">
              {clock(justIn)} · {session.full_name}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="h-28 w-28 rounded-full grid place-items-center bg-accent-soft text-accent text-4xl">⚡</div>
          <div>
            <div className="text-lg font-extrabold">Tap to check in</div>
            <div className="text-sm text-muted mt-0.5">
              In the real app this is a QR scan, fingerprint or face — same result.
            </div>
          </div>
          <button className="btn w-full max-w-xs" onClick={go} disabled={busy}>
            {busy ? "…" : "Check in now"}
          </button>
        </>
      )}

      <div className="card p-4 w-full text-left mt-2">
        <Row k="Last visit" v={timeAgo(stats.lastVisit)} />
        <Row k="This week" v={plural(stats.visits7d, "session")} />
        <Row k="This month" v={plural(stats.thisMonth, "session")} />
        <Row k="Streak" v={plural(stats.streakDays, "day")} last />
      </div>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex justify-between py-2 ${last ? "" : "border-b border-line"}`}>
      <span className="text-sm text-muted">{k}</span>
      <span className="text-sm font-bold">{v}</span>
    </div>
  );
}
