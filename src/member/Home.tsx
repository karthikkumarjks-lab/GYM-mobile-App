import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, type MemberStats } from "../lib/db";
import type { Plan, Session } from "../lib/types";
import { Loading } from "../components/ui";

export default function Home({ session }: { session: Session }) {
  const mid = session.member_id!;
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    db.memberStats(mid).then(setStats);
    db.getPlan(mid).then(setPlan);
  }, [mid]);

  if (!stats) return <Loading />;
  const first = session.full_name.split(" ")[0];

  return (
    <div className="flex flex-col gap-4 pt-1">
      <div>
        <h1 className="text-2xl font-extrabold">Hi {first} 👋</h1>
        <p className="text-sm text-muted mt-0.5">
          {stats.streakDays > 0 ? (
            <>You're on a <b>{stats.streakDays}-day streak</b>. Keep it alive.</>
          ) : (
            <>No streak yet — check in today to start one.</>
          )}
        </p>
      </div>

      <div className="rounded-2xl p-4 bg-dark text-white">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-white/50">Today's plan</span>
          {plan?.day_label && <span className="pill bg-accent-soft text-accent">{plan.day_label}</span>}
        </div>
        {plan ? (
          <>
            <div className="text-base font-extrabold mt-2">{plan.title}</div>
            <div className="text-xs text-white/60 mt-0.5">
              {plan.exercises.length} exercises · assigned by {plan.assigned_by}
            </div>
          </>
        ) : (
          <div className="text-sm text-white/60 mt-2">Your trainer hasn't assigned a plan yet.</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold">{stats.visits7d}</div>
          <div className="text-[10px] text-muted font-semibold">this week</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold">{stats.thisMonth}</div>
          <div className="text-[10px] text-muted font-semibold">this month</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-extrabold">{stats.streakDays}</div>
          <div className="text-[10px] text-muted font-semibold">day streak</div>
        </div>
      </div>

      <Link to="/m/checkin" className="btn">
        Check in
      </Link>
      <Link to="/m/meal" className="btn-ghost text-center">
        Log a meal
      </Link>

      {plan && (
        <div>
          <div className="eyebrow mb-2">Your workout</div>
          <div className="card divide-y divide-line">
            {plan.exercises.map((ex, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{ex.name}</span>
                <span className="text-xs text-muted">{ex.sets} × {ex.reps}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
