"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamLogo, getTheme } from "../lib/teamBrands";

const TEAMS = [
  "Brandify",
  "Swingtradinglab",
  "Home Service Experts",
  "Collective Shift",
  "Deal Flip Formula",
  "Vibecoding Accelerator",
  "RB Launch",
];

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

type View = "home" | "team" | "team-password" | "admin";
type Destination = "dashboard" | "form";

export default function Portal() {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [destination, setDestination] = useState<Destination>("form");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function goToTeamPassword(team: string, dest: Destination) {
    setSelectedTeam(team);
    setDestination(dest);
    setPassword("");
    setError("");
    setView("team-password");
  }

  function submitTeamPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password === TEAM_PASSWORDS[selectedTeam]) {
      localStorage.setItem("slings_role", "team");
      localStorage.setItem("slings_team", selectedTeam);
      router.push(destination === "form" ? "/form" : "/dashboard");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  }

  function submitAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("slings_role", "admin");
      localStorage.setItem("slings_team", "");
      router.push("/dashboard");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  }

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

      {view === "home" && (
        <div className="w-full max-w-sm space-y-3 slide-up">
          <button
            onClick={() => setView("team")}
            className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">I'm a closer</p>
                <p className="text-xs text-zinc-500 mt-0.5">Submit EOD or view your team's dashboard</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setView("admin")}
            className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Admin</p>
                <p className="text-xs text-zinc-500 mt-0.5">Full access across all teams</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {view === "team" && (
        <div className="w-full max-w-sm slide-up">
          <button onClick={() => setView("home")} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <p className="text-zinc-400 text-sm font-medium mb-3">Select your team</p>
          <div className="space-y-2">
            {TEAMS.map((team) => (
              <div
                key={team}
                onClick={() => setSelectedTeam(t => t === team ? "" : team)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTeam === team
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <span className={`text-sm font-medium ${selectedTeam === team ? "text-white" : "text-zinc-300"}`}>{team}</span>
                {selectedTeam === team && (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          {selectedTeam && (
            <div className="mt-5 grid grid-cols-2 gap-3 slide-up">
              <button
                onClick={() => { localStorage.setItem("slings_role", "team"); localStorage.setItem("slings_team", selectedTeam); router.push("/form"); }}
                className="flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Submit EOD
              </button>
              <button
                onClick={() => goToTeamPassword(selectedTeam, "dashboard")}
                className="flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {view === "team-password" && (() => {
        const theme = getTheme(selectedTeam);
        return (
          <div className="w-full max-w-sm slide-up">
            <button onClick={() => { setView("team"); setError(""); setPassword(""); }} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>

            {/* Team logo */}
            <div className="flex justify-center mb-8 py-6 px-4 rounded-2xl" style={{ backgroundColor: theme.bgTint, border: `1px solid ${theme.borderColor}` }}>
              <TeamLogo team={selectedTeam} size={52} />
            </div>

            <p className="text-zinc-500 text-xs text-center mb-5">Enter your team password to continue</p>

            <form onSubmit={submitTeamPassword} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Team password..."
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors placeholder-zinc-600"
                style={{ borderColor: password ? theme.primary : undefined }}
              />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button
                type="submit"
                disabled={!password}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${!password ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : ""}`}
                style={password ? { backgroundColor: theme.primary, color: theme.textOnPrimary } : {}}
              >
                Continue
              </button>
            </form>
          </div>
        );
      })()}

      {view === "admin" && (
        <div className="w-full max-w-sm slide-up">
          <button onClick={() => { setView("home"); setError(""); setPassword(""); }} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>

          {/* All team logos collage */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { team: "Brandify", color: "#e8e8e8" },
              { team: "Swingtradinglab", color: "#00AAFF" },
              { team: "Home Service Experts", color: "#B8945A" },
              { team: "Collective Shift", color: "#F05A28" },
              { team: "Deal Flip Formula", color: "#2A7DE1" },
              { team: "Vibecoding Accelerator", color: "#A855F7" },
              { team: "RB Launch", color: "#E63946" },
            ].map(({ team, color }) => (
              <div
                key={team}
                className="flex items-center justify-center rounded-xl py-3 px-2 overflow-hidden"
                style={{ backgroundColor: `${color}10`, border: `1px solid ${color}25` }}
              >
                <div style={{ transform: "scale(0.55)", transformOrigin: "center", width: 80, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TeamLogo team={team} size={28} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-zinc-500 text-xs text-center mb-5">Full access across all teams</p>

          <form onSubmit={submitAdmin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="Admin password..."
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors placeholder-zinc-600"
            />
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              type="submit"
              disabled={!password}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                password ? "bg-white hover:bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Access Admin Dashboard
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
