"use client";

import { useState, useEffect } from "react";

const TEAMS = ["Brandify", "Swingtradinglab", "Home Service Experts", "Collective Shift", "Deal Flip Formula", "Vibecoding Accelerator", "RB Launch"];

interface RosterEntry { id: number; team: string; name: string; }

interface Props { onClose: () => void; }

export default function ManageRosterModal({ onClose }: Props) {
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [selectedTeam, setSelectedTeam] = useState(TEAMS[0]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/roster").then(r => r.json()).then(d => { setRoster(d); setLoading(false); });
  }, []);

  const teamRoster = roster.filter(r => r.team === selectedTeam);

  async function addRep() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team: selectedTeam, name: newName.trim() }),
    });
    if (res.ok) {
      const updated = await fetch("/api/roster").then(r => r.json());
      setRoster(updated);
      setNewName("");
    }
    setSaving(false);
  }

  async function removeRep(id: number) {
    await fetch(`/api/roster/${id}`, { method: "DELETE" });
    setRoster(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-semibold">Manage Roster</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Team tabs */}
        <div className="px-6 pt-4 flex gap-2 flex-wrap">
          {TEAMS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTeam(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTeam === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Roster list */}
        <div className="px-6 py-4 min-h-[160px]">
          {loading ? (
            <p className="text-zinc-500 text-sm">Loading...</p>
          ) : teamRoster.length === 0 ? (
            <p className="text-zinc-600 text-sm">No reps on this team yet.</p>
          ) : (
            <div className="space-y-2">
              {teamRoster.map(entry => (
                <div key={entry.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2.5">
                  <span className="text-white text-sm">{entry.name}</span>
                  <button
                    onClick={() => removeRep(entry.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors ml-4"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add rep */}
        <div className="px-6 pb-6 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500 mb-2">Add rep to {selectedTeam}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addRep()}
              placeholder="Full name..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 placeholder-zinc-600"
            />
            <button
              onClick={addRep}
              disabled={!newName.trim() || saving}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-lg text-sm font-semibold transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
