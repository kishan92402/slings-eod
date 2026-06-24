"use client";

import { useState } from "react";

interface Submission {
  id?: string;
  team: string;
  name: string;
  date?: string;
  slots_open: string;
  calls_booked: string;
  calls_shown: string;
  calls_cancelled: string;
  followup_scheduled: string;
  followup_shown: string;
  reschedules_made: string;
  reschedules_shown: string;
  offers_given: string;
  deposits_taken: string;
  deals_closed: string;
  cash_collected: string;
  revenue_generated: string;
  submittedAt: string;
}

const FIELDS: { key: keyof Submission; label: string; prefix?: string }[] = [
  { key: "slots_open", label: "Slots Open" },
  { key: "calls_booked", label: "Calls Booked" },
  { key: "calls_shown", label: "Calls Shown" },
  { key: "calls_cancelled", label: "Calls Cancelled" },
  { key: "followup_scheduled", label: "Follow Up Calls Scheduled" },
  { key: "followup_shown", label: "Follow Up Calls Shown" },
  { key: "reschedules_made", label: "Reschedules Made" },
  { key: "reschedules_shown", label: "Reschedules Shown" },
  { key: "offers_given", label: "Offers Given" },
  { key: "deposits_taken", label: "Deposits Taken", prefix: "$" },
  { key: "deals_closed", label: "Deals Closed" },
  { key: "cash_collected", label: "Cash Collected", prefix: "$" },
  { key: "revenue_generated", label: "Revenue Generated", prefix: "$" },
];

interface Props {
  submission: Submission;
  index: number;
  onClose: () => void;
  onSaved: (updated: Submission) => void;
  accentColor?: string;
}

export default function EditModal({ submission, index, onClose, onSaved, accentColor = "#10b981" }: Props) {
  const [values, setValues] = useState<Submission>({ ...submission });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const id = submission.id ?? String(index);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/responses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved(values);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div>
            <h2 className="text-white font-semibold">Edit EOD Report</h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {submission.name} · {submission.team} · {submission.submittedAt?.slice(0, 10)}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {FIELDS.map(({ key, label, prefix }) => (
            <div key={key}>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">
                {label}
              </label>
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm pointer-events-none">{prefix}</span>
                )}
                <input
                  type="number"
                  min="0"
                  value={values[key] as string}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 text-white text-sm outline-none transition-colors ${prefix ? "pl-7 pr-3" : "px-3"}`}
                  style={{ borderColor: undefined }}
                  onFocus={e => (e.target.style.borderColor = accentColor)}
                  onBlur={e => (e.target.style.borderColor = "")}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between sticky bottom-0 bg-zinc-900">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: accentColor, color: "#000" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
