import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { db } from "./lib/db";
import type { Session } from "./lib/types";

import OwnerShell from "./owner/OwnerShell";
import Dashboard from "./owner/Dashboard";
import Members from "./owner/Members";
import WinBack from "./owner/WinBack";
import Payments from "./owner/Payments";
import Store from "./owner/Store";
import Branding from "./owner/Branding";

import MemberShell from "./member/MemberShell";
import Home from "./member/Home";
import CheckIn from "./member/CheckIn";
import Meal from "./member/Meal";
import Shop from "./member/Shop";

export default function App() {
  const [session, setSession] = useState<Session | null>(db.getSession());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    db.bootstrap().then((s) => {
      setSession(s);
      setReady(true);
    });
    const off = db.onAuthChange(setSession);
    return off;
  }, []);

  if (!ready)
    return <div className="min-h-full grid place-items-center text-sm text-muted">Loading…</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/owner"
          element={session?.role === "owner" ? <OwnerShell onSignOut={() => setSession(null)} /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="winback" element={<WinBack />} />
          <Route path="store" element={<Store />} />
          <Route path="payments" element={<Payments />} />
          <Route path="branding" element={<Branding />} />
        </Route>

        <Route
          path="/m"
          element={session?.role === "member" ? <MemberShell onSignOut={() => setSession(null)} /> : <Navigate to="/login" />}
        >
          <Route index element={<Home session={session!} />} />
          <Route path="checkin" element={<CheckIn session={session!} />} />
          <Route path="meal" element={<Meal session={session!} />} />
          <Route path="shop" element={<Shop />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={session ? (session.role === "owner" ? "/owner" : "/m") : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setErr(null);
    try {
      const s = await db.signIn(email, password);
      location.assign(s.role === "owner" ? "/owner" : "/m");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <div className="h-14 w-14 rounded-2xl bg-accent grid place-items-center text-white text-2xl font-black overflow-hidden">
            <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold mt-4">Iron House Gym</h1>
          <p className="text-sm text-muted mt-1">Sign in with the email your gym set up for you.</p>
        </div>

        {err && <div className="card p-3 text-sm text-accent font-semibold">{err}</div>}

        <label className="flex flex-col gap-1">
          <span className="eyebrow">Email</span>
          <input
            className="field"
            type="email"
            autoComplete="username"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Password</span>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className="btn" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-muted">
          Don't have an account? Ask your gym to add you.
        </p>
      </form>
    </div>
  );
}
