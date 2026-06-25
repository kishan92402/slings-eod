"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTheme, DEFAULT_THEME, type TeamTheme } from "../lib/teamBrands";

const TEAMS = ["Brandify", "Swingtradinglab", "Home Service Experts", "Collective Shift", "Deal Flip Formula", "Vibecoding Accelerator", "RB Launch"];

const WHAT_SENT_OPTIONS = ["Videos", "Testimonials", "Other"];
const OBJECTION_OPTIONS = ["Fear", "Money", "Logistics", "Other"];

interface Followup {
  id: string;
  team: string;
  lead_name: string;
  lead_email: string;
  closer_name: string;
  last_followup_date: string;
  what_sent: string;
  what_sent_other: string;
  next_followup_date: string;
  original_objection: string;
  original_objection_other: string;
  createdAt: string;
}

const EMPTY: Omit<Followup, "id" | "createdAt"> = {
  team: "", lead_name: "", lead_email: "", closer_name: "",
  last_followup_date: "", what_sent: "", what_sent_other: "",
  next_followup_date: "", original_objection: "", original_objection_other: "",
};

function isOverdue(date: string) {
  if (!date) return false;
  return new Date(date + "T12:00:00") < new Date();
}

function isToday(date: string) {
  if (!date) return false;
  const d = new Date(date + "T12:00:00");
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function FollowupTracker() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "team" | null>(null);
  const [myTeam, setMyTeam] = useState("");
  const [theme, setTheme] = useState<TeamTheme>(DEFAULT_THEME);
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [roster, setRoster] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Followup | null>(null);
  const [form, setForm] = useState<Omit<Followup, "id" | "createdAt">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("slings_role") as "admin" | "team" | null;
    const storedTeam = localStorage.getItem("slings_team") || "";
    if (!storedRole) { router.push("/"); return; }
    setRole(storedRole);
    setMyTeam(storedTeam);
    if (storedRole === "team") {
      setSelectedTeam(storedTeam);
      setTheme(getTheme(storedTeam));
    }
  }, [router]);

  const loadFollowups = useCallback(async () => {
    setLoading(true);
    const team = role === "team" ? myTeam : (selectedTeam !== "All Teams" ? selectedTeam : "");
    const url = team ? `/api/followups?team=${encodeURIComponent(team)}` : "/api/followups";
    const data = await fetch(url).then(r => r.json());
    setFollowups(data);
    setLoading(false);
  }, [role, myTeam, selectedTeam]);

  useEffect(() => {
    if (role) loadFollowups();
  }, [role, loadFollowups]);

  useEffect(() => {
    const team = role === "team" ? myTeam : (selectedTeam !== "All Teams" ? selectedTeam : "");
    if (team) {
      fetch(`/api/roster?role=closer&team=${encodeURIComponent(team)}`)
        .then(r => r.json())
        .then(d => setRoster(d.map((r: { name: string }) => r.name)));
    } else {
      fetch("/api/roster?role=closer").then(r => r.json()).then(d => setRoster(d.map((r: { name: string }) => r.name)));
    }
  }, [role, myTeam, selectedTeam]);

  function openAdd() {
    const team = role === "team" ? myTeam : (selectedTeam !== "All Teams" ? selectedTeam : "");
    setEditing(null);
    setForm({ ...EMPTY, team });
    setShowModal(true);
  }

  function openEdit(f: Followup) {
    setEditing(f);
    setForm({ team: f.team, lead_name: f.lead_name, lead_email: f.lead_email, closer_name: f.closer_name,
      last_followup_date: f.last_followup_date, what_sent: f.what_sent, what_sent_other: f.what_sent_other,
      next_followup_date: f.next_followup_date, original_objection: f.original_objection,
      original_objection_other: f.original_objection_other });
    setShowModal(true);
  }

  async function saveForm() {
    if (!form.lead_name.trim()) return;
    setSaving(true);
    const payload = { ...form,
      what_sent: form.what_sent === "Other" ? form.what_sent_other : form.what_sent,
      original_objection: form.original_objection === "Other" ? form.original_objection_other : form.original_objection,
    };
    if (editing) {
      await fetch(`/api/followups/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setSaving(false);
    setShowModal(false);
    loadFollowups();
  }

  async function deleteFollowup(id: string) {
    setDeletingId(id);
    await fetch(`/api/followups/${id}`, { method: "DELETE" });
    setFollowups(prev => prev.filter(f => f.id !== id));
    setDeletingId(null);
  }

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  const displayTeams = ["All Teams", ...TEAMS];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <div className="border-b border-zinc-800 bg-[#0a0a0a] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight">Follow-Up Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            {role === "admin" && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                {displayTeams.map(t => (
                  <button key={t} onClick={() => setSelectedTeam(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedTeam === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {t === "All Teams" ? "All" : t.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
            <button onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
            <button onClick={() => { localStorage.clear(); router.push("/"); }}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors px-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-zinc-600">
            <svg className="w-5 h-5 animate-spin mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Loading...
          </div>
        ) : followups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-zinc-500 font-medium">No follow-ups yet</p>
            <p className="text-zinc-600 text-sm mt-1">Add your first lead to get started</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Lead</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Closer</th>
                    {role === "admin" && <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Team</th>}
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Last Follow-Up</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">What Was Sent</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Next Follow-Up</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Objection</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {followups.map(f => {
                    const overdue = isOverdue(f.next_followup_date);
                    const today = isToday(f.next_followup_date);
                    return (
                      <tr key={f.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 text-white font-medium text-sm">{f.lead_name}</td>
                        <td className="px-4 py-3 text-zinc-400 text-sm">{f.lead_email || "–"}</td>
                        <td className="px-4 py-3 text-zinc-300 text-sm">{f.closer_name || "–"}</td>
                        {role === "admin" && <td className="px-4 py-3 text-zinc-500 text-xs">{f.team}</td>}
                        <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                          {f.last_followup_date ? new Date(f.last_followup_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "–"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-sm">{f.what_sent || "–"}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {f.next_followup_date ? (
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${overdue ? "bg-red-500/15 text-red-400" : today ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800 text-zinc-300"}`}>
                              {new Date(f.next_followup_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {overdue && " · Overdue"}
                              {today && " · Today"}
                            </span>
                          ) : "–"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-sm">{f.original_objection || "–"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(f)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => deleteFollowup(f.id)} disabled={deletingId === f.id} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{editing ? "Edit Lead" : "Add Lead"}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Team (admin only) */}
              {role === "admin" && (
                <div>
                  <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Team</label>
                  <select value={form.team} onChange={e => set("team", e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500">
                    <option value="">Select team...</option>
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {/* Lead Name */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Lead Name</label>
                <input type="text" value={form.lead_name} onChange={e => set("lead_name", e.target.value)}
                  placeholder="Full name..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500 placeholder-zinc-600" />
              </div>

              {/* Lead Email */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Lead Email</label>
                <input type="email" value={form.lead_email} onChange={e => set("lead_email", e.target.value)}
                  placeholder="email@example.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500 placeholder-zinc-600" />
              </div>

              {/* Closer Name */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Closer</label>
                <select value={form.closer_name} onChange={e => set("closer_name", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500">
                  <option value="">Select closer...</option>
                  {roster.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Last Follow-Up */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Last Follow-Up Date</label>
                <input type="date" value={form.last_followup_date} onChange={e => set("last_followup_date", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500" />
              </div>

              {/* What Was Sent */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">What Was Sent</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {WHAT_SENT_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => set("what_sent", o)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.what_sent === o ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                      {o}
                    </button>
                  ))}
                </div>
                {form.what_sent === "Other" && (
                  <input type="text" value={form.what_sent_other} onChange={e => set("what_sent_other", e.target.value)}
                    placeholder="Describe what was sent..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500 placeholder-zinc-600" />
                )}
              </div>

              {/* Next Follow-Up */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Next Follow-Up Date</label>
                <input type="date" value={form.next_followup_date} onChange={e => set("next_followup_date", e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500" />
              </div>

              {/* Original Objection */}
              <div>
                <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1.5">Original Objection</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {OBJECTION_OPTIONS.map(o => (
                    <button key={o} type="button" onClick={() => set("original_objection", o)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.original_objection === o ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
                      {o}
                    </button>
                  ))}
                </div>
                {form.original_objection === "Other" && (
                  <input type="text" value={form.original_objection_other} onChange={e => set("original_objection_other", e.target.value)}
                    placeholder="Describe the objection..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-zinc-500 placeholder-zinc-600" />
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={saveForm} disabled={!form.lead_name.trim() || saving}
                className="flex-1 py-2.5 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-lg text-sm font-semibold transition-colors"
                style={form.lead_name.trim() ? { backgroundColor: theme.primary, color: theme.textOnPrimary } : {}}>
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
