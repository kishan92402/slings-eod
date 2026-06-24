"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTheme, TeamLogo } from "../lib/teamBrands";

const ADMIN_PASSWORD = "Slingsteam101$$";

const TEAM_PASSWORDS: Record<string, string> = {
  "Brandify": "Brandify123!",
  "Swingtradinglab": "STL123!",
  "Home Service Experts": "HSE123!",
  "Collective Shift": "CS123!",
  "Deal Flip Formula": "DFF123!",
  "Vibecoding Accelerator": "Vibe123!",
  "RB Launch": "RBLaunch123!",
};

type View = "login" | "team-action";

export default function Portal() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [matchedTeam, setMatchedTeam] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Check admin
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("slings_role", "admin");
      localStorage.setItem("slings_team", "");
      router.push("/dashboard");
      return;
    }

    // Check team passwords
    const team = Object.entries(TEAM_PASSWORDS).find(([, pw]) => pw === password)?.[0];
    if (team) {
      localStorage.setItem("slings_role", "team");
      localStorage.setItem("slings_team", team);
      setMatchedTeam(team);
      setView("team-action");
      return;
    }

    setError("Incorrect password");
    setPassword("");
  }

  const theme = getTheme(matchedTeam);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Slings Inc</h1>
        <p className="text-zinc-500 text-sm mt-1">Closer EOD Portal</p>
      </div>

      {view === "login" && (
        <div className="w-full max-w-sm slide-up">
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter your password..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors placeholder-zinc-600"
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={!password}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                password ? "bg-emerald-500 hover:bg-emerald-400 text-black" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {view === "team-action" && (
        <div className="w-full max-w-sm slide-up">
          {/* Team logo */}
          <div className="flex justify-center mb-8 py-6 px-4 rounded-2xl" style={{ backgroundColor: theme.bgTint, border: `1px solid ${theme.borderColor}` }}>
            <TeamLogo team={matchedTeam} size={52} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/form")}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit EOD
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2 py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>

          <button
            onClick={() => { setView("login"); setPassword(""); setMatchedTeam(""); }}
            className="w-full mt-4 text-zinc-600 hover:text-zinc-400 text-xs text-center transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
