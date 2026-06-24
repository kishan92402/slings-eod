"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TeamLogo, getTheme, DEFAULT_THEME, type TeamTheme } from "../lib/teamBrands";
import EditModal from "./EditModal";

interface Submission {
  team: string;
  name: string;
  slots_open: string;
  date: string;
  calls_booked: string;
  calls_shown: string;
  calls_cancelled: string;
  followup_scheduled: string;
  followup_shown: string;
  reschedules_made: string;
  reschedules_shown: string;
  offers_given: string;
  deals_closed: string;
  deposits_taken: string;
  cash_collected: string;
  revenue_generated: string;
  submittedAt: string;
}

const TEAMS = ["All Teams", "Brandify", "Swingtradinglab", "Home Service Experts", "Collective Shift", "Deal Flip Formula", "Vibecoding Accelerator"];

type DateRange = "this_week" | "this_month" | "last_7" | "last_30" | "this_year" | "all_time";
const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_7", label: "Last 7 Days" },
  { value: "last_30", label: "Last 30 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

function getDateBounds(range: DateRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);

  if (range === "this_week") {
    const day = now.getDay();
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    start.setHours(0, 0, 0, 0);
  } else if (range === "this_month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === "last_7") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (range === "last_30") {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else if (range === "this_year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else {
    start = new Date(0);
  }

  return { start, end };
}

function n(v: string | undefined) { return parseFloat(v || "0") || 0; }
function pct(a: number, b: number) { return b ? (a / b) * 100 : null; }
function fmt(v: number | null) { return v === null ? "–" : v.toFixed(1) + "%"; }
function fmtMoney(v: number) { return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }); }

function pctColor(v: number | null, low = 30, mid = 60) {
  if (v === null) return "text-zinc-600";
  if (v >= mid) return "text-emerald-400";
  if (v >= low) return "text-amber-400";
  return "text-red-400";
}

interface Row {
  name: string; team: string; date: string;
  slots: number; booked: number; shown: number; cancelled: number;
  fuSched: number; fuShown: number;
  rescMade: number; rescShown: number;
  offers: number; closed: number; deposits: number;
  cash: number; revenue: number;
  slotUtil: number | null; showPct: number | null; cancelPct: number | null;
  offerPct: number | null; closePct: number | null;
  cashPerBook: number | null; revPerBook: number | null;
  collection: number | null; rescShowPct: number | null;
}

function toRow(s: Submission): Row {
  const slots = n(s.slots_open), booked = n(s.calls_booked), shown = n(s.calls_shown);
  const cancelled = n(s.calls_cancelled);
  const fuSched = n(s.followup_scheduled), fuShown = n(s.followup_shown);
  const rescMade = n(s.reschedules_made), rescShown = n(s.reschedules_shown);
  const offers = n(s.offers_given), closed = n(s.deals_closed), deposits = n(s.deposits_taken);
  const cash = n(s.cash_collected), revenue = n(s.revenue_generated);
  const date = new Date(s.submittedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return {
    name: s.name, team: s.team, date,
    slots, booked, shown, cancelled, fuSched, fuShown, rescMade, rescShown,
    offers, closed, deposits, cash, revenue,
    slotUtil: pct(shown, slots), showPct: pct(shown, booked),
    cancelPct: pct(cancelled, booked),
    offerPct: pct(offers, shown), closePct: pct(closed, shown),
    cashPerBook: booked ? cash / booked : null,
    revPerBook: booked ? revenue / booked : null,
    collection: pct(cash, revenue), rescShowPct: pct(rescShown, rescMade),
  };
}

function aggregate(rows: Row[]): Omit<Row, "name" | "team" | "date"> & { name: string; team: string; date: string } {
  const s = (k: keyof Row) => rows.reduce((a, r) => a + (r[k] as number), 0);
  const slots = s("slots"), booked = s("booked"), shown = s("shown");
  const cancelled = s("cancelled");
  const rescMade = s("rescMade"), rescShown = s("rescShown");
  const offers = s("offers"), closed = s("closed"), deposits = s("deposits");
  const cash = s("cash"), revenue = s("revenue");
  return {
    name: "Total", team: "", date: "",
    slots, booked, shown, cancelled, fuSched: s("fuSched"), fuShown: s("fuShown"),
    rescMade, rescShown, offers, closed, deposits, cash, revenue,
    slotUtil: pct(shown, slots), showPct: pct(shown, booked),
    cancelPct: pct(cancelled, booked),
    offerPct: pct(offers, shown), closePct: pct(closed, shown),
    cashPerBook: booked ? cash / booked : null,
    revPerBook: booked ? revenue / booked : null,
    collection: pct(cash, revenue), rescShowPct: pct(rescShown, rescMade),
  };
}

const TH = "px-4 py-3 text-right text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap";
const TH_L = "px-4 py-3 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider";
const TD = "px-4 py-3 text-right text-sm text-zinc-300 tabular-nums";
const TD_L = "px-4 py-3 text-left text-sm";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function DataRow({ row, isTotal, onEdit }: { row: Row; isTotal?: boolean; onEdit?: () => void }) {
  const base = isTotal
    ? "border-t-2 border-zinc-700 bg-zinc-900/60 font-semibold"
    : `border-b border-zinc-800/40 transition-colors group ${onEdit ? "cursor-pointer hover:bg-zinc-800/60" : "hover:bg-zinc-900/40"}`;
  return (
    <tr className={base} onClick={!isTotal && onEdit ? onEdit : undefined}>
      {/* Date */}
      <td className={`${TD_L} text-zinc-500 text-xs whitespace-nowrap`}>
        {isTotal ? "" : row.date}
      </td>
      <td className={`${TD_L} ${isTotal ? "text-zinc-400 text-xs uppercase tracking-wider" : "text-white font-medium"}`}>
        <div className="flex items-center gap-2">
          {isTotal ? "Day Total" : row.name}
          {!isTotal && onEdit && (
            <svg className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )}
        </div>
      </td>
      <td className={TD}>{row.slots}</td>
      <td className={TD}>{row.booked}</td>
      <td className={TD}>{row.shown}</td>
      <td className={TD}>{row.cancelled}</td>
      <td className={TD}>{row.fuSched}</td>
      <td className={TD}>{row.fuShown}</td>
      <td className={TD}>{row.rescMade}</td>
      <td className={TD}>{row.rescShown}</td>
      <td className={TD}>{row.offers}</td>
      <td className={TD}>{row.closed}</td>
      <td className={`${TD} font-medium text-white`}>{fmtMoney(row.deposits)}</td>
      <td className={`${TD} font-medium text-white`}>{fmtMoney(row.cash)}</td>
      <td className={`${TD} font-medium text-white`}>{fmtMoney(row.revenue)}</td>
      <td className={`${TD} border-l border-zinc-800 font-medium ${pctColor(row.slotUtil)}`}>{fmt(row.slotUtil)}</td>
      <td className={`${TD} font-medium ${pctColor(row.showPct)}`}>{fmt(row.showPct)}</td>
      <td className={`${TD} font-medium ${pctColor(row.cancelPct ? 100 - row.cancelPct : null, 60, 90)}`}>{fmt(row.cancelPct)}</td>
      <td className={`${TD} font-medium ${pctColor(row.offerPct)}`}>{fmt(row.offerPct)}</td>
      <td className={`${TD} font-medium ${pctColor(row.closePct, 20, 40)}`}>{fmt(row.closePct)}</td>
      <td className={TD}>{row.cashPerBook !== null ? fmtMoney(row.cashPerBook) : "–"}</td>
      <td className={TD}>{row.revPerBook !== null ? fmtMoney(row.revPerBook) : "–"}</td>
      <td className={`${TD} font-medium ${pctColor(row.collection)}`}>{fmt(row.collection)}</td>
      <td className={`${TD} font-medium ${pctColor(row.rescShowPct)}`}>{fmt(row.rescShowPct)}</td>
    </tr>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState("All Teams");
  const [rep, setRep] = useState("All Reps");
  const [range, setRange] = useState<DateRange>("last_30");
  const [teamOpen, setTeamOpen] = useState(false);
  const [repOpen, setRepOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "team" | null>(null);
  const [myTeam, setMyTeam] = useState("");
  const [theme, setTheme] = useState<TeamTheme>(DEFAULT_THEME);
  const [editing, setEditing] = useState<{ submission: Submission; index: number } | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("slings_role") as "admin" | "team" | null;
    const storedTeam = localStorage.getItem("slings_team") || "";
    if (!storedRole) { router.push("/"); return; }
    setRole(storedRole);
    setMyTeam(storedTeam);
    if (storedRole === "team") {
      setTeam(storedTeam);
      setTheme(getTheme(storedTeam));
    }
    setRep("All Reps");
    fetch("/api/responses").then(r => r.json()).then(d => { setSubmissions(d); setLoading(false); });
  }, [router]);

  const filtered = useMemo(() => {
    const { start, end } = getDateBounds(range);
    return submissions.filter(s => {
      const d = new Date(s.submittedAt);
      return (team === "All Teams" || s.team === team) &&
             (rep === "All Reps" || s.name === rep) &&
             d >= start && d <= end;
    });
  }, [submissions, team, rep, range]);

  // Available reps based on selected team
  const availableReps = useMemo(() => {
    const teamFiltered = submissions.filter(s => team === "All Teams" || s.team === team);
    return ["All Reps", ...Array.from(new Set(teamFiltered.map(s => s.name))).sort()];
  }, [submissions, team]);

  const rows = useMemo(() => filtered.map(toRow), [filtered]);

  // How many unique dates in current filtered set
  const uniqueDates = useMemo(() => new Set(rows.map(r => r.date)).size, [rows]);

  // group: team → date → rows (dates descending)
  const byTeam = useMemo(() => {
    const teamMap = new Map<string, Map<string, { rows: Row[]; ts: number }>>();
    const teamOrder = TEAMS.filter(t => t !== "All Teams");

    for (let i = 0; i < filtered.length; i++) {
      const s = filtered[i];
      const r = rows[i];
      if (!teamMap.has(s.team)) teamMap.set(s.team, new Map());
      const dateMap = teamMap.get(s.team)!;
      if (!dateMap.has(r.date)) dateMap.set(r.date, { rows: [], ts: 0 });
      const entry = dateMap.get(r.date)!;
      entry.rows.push(r);
      const t = new Date(s.submittedAt).getTime();
      if (t > entry.ts) entry.ts = t;
    }

    return teamOrder
      .filter(t => teamMap.has(t))
      .map(teamName => ({
        teamName,
        dates: Array.from(teamMap.get(teamName)!.entries())
          .sort((a, b) => b[1].ts - a[1].ts)
          .map(([date, { rows: dateRows }]) => ({ date, rows: dateRows })),
      }));
  }, [rows, filtered]);

  const totals = rows.length ? aggregate(rows) : null;
  const rangeLabel = DATE_RANGES.find(d => d.value === range)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" onClick={() => { setTeamOpen(false); setRangeOpen(false); }}>
      {/* Top nav */}
      <div className="border-b border-zinc-800 bg-[#0a0a0a] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Show team logo when team-scoped (rep login OR admin filtered to one team) */}
            {(role === "team" && myTeam) || (role === "admin" && team !== "All Teams") ? (
              <div className="flex items-center gap-2.5">
                <TeamLogo team={role === "team" ? myTeam : team} size={32} />
                {role === "admin" && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-normal">Admin</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight">Slings Inc</span>
                  {role === "admin" && (
                    <span className="ml-2 text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-normal">Admin</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Date range dropdown */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setRangeOpen(o => !o); setTeamOpen(false); }}
                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm text-zinc-300 hover:text-white transition-all min-w-[130px] justify-between"
              >
                <span>{rangeLabel}</span>
                <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${rangeOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {rangeOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-30">
                  {DATE_RANGES.map(d => (
                    <button key={d.value} onClick={() => { setRange(d.value); setRangeOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${range === d.value ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Team dropdown — admin only */}
            {role === "admin" && (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { setTeamOpen(o => !o); setRangeOpen(false); setRepOpen(false); }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm transition-all min-w-[180px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${team === "All Teams" ? "bg-zinc-500" : "bg-emerald-500"}`} />
                    <span className={team === "All Teams" ? "text-zinc-400" : "text-white"}>{team}</span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${teamOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {teamOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-30">
                    {TEAMS.map(t => (
                      <button key={t} onClick={() => { setTeam(t); setTeamOpen(false); setRep("All Reps"); setTheme(t === "All Teams" ? DEFAULT_THEME : getTheme(t)); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${team === t ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t === "All Teams" ? "bg-zinc-500" : "bg-emerald-500/60"}`} />
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rep dropdown */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { setRepOpen(o => !o); setTeamOpen(false); setRangeOpen(false); }}
                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm transition-all min-w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className={rep === "All Reps" ? "text-zinc-400" : "text-white"}>{rep}</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${repOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {repOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-30">
                  {availableReps.map(r => (
                    <button key={r} onClick={() => { setRep(r); setRepOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${rep === r ? "bg-emerald-500/10" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}
                      style={rep === r ? { color: theme.primary } : {}}>
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/form" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Submit EOD
            </Link>

            <button
              onClick={() => { localStorage.clear(); router.push("/"); }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
        ) : (
          <>
            {/* Summary cards */}
            {totals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: "Cash Collected", value: fmtMoney(totals.cash), sub: fmt(totals.collection) + " collection" },
                  { label: "Revenue", value: fmtMoney(totals.revenue), sub: `${totals.closed} deals` },
                  { label: "Show Rate", value: fmt(totals.showPct), sub: `${totals.shown} of ${totals.booked} shown` },
                  { label: "Close Rate", value: fmt(totals.closePct), sub: `${totals.closed} of ${totals.shown} shown` },
                  { label: "Cash / Booking", value: totals.cashPerBook !== null ? fmtMoney(totals.cashPerBook) : "–", sub: `${totals.booked} bookings` },
                ].map(c => (
                  <div key={c.label} className="bg-zinc-900 rounded-xl p-5" style={{ border: `1px solid ${theme.borderColor}` }}>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">{c.label}</p>
                    <p className="text-2xl font-bold text-white">{c.value}</p>
                    {c.sub && <p className="text-xs mt-1" style={{ color: theme.primary }}>{c.sub}</p>}
                  </div>
                ))}
              </div>
            ) : null}

            {/* No data */}
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
                <svg className="w-14 h-14 mb-4 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-medium text-zinc-500 text-lg">No submissions found</p>
                <p className="text-sm mt-1">Try a different date range or team filter</p>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1500px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60">
                        <th className={`${TH_L} text-zinc-600 whitespace-nowrap`}>Date</th>
                        <th className={`${TH_L} sticky left-0 bg-zinc-900 z-10`}>Closer</th>
                        <th className={TH}>Slots</th>
                        <th className={TH}>Booked</th>
                        <th className={TH}>Shown</th>
                        <th className={TH}>Cancelled</th>
                        <th className={TH}>FU Sched</th>
                        <th className={TH}>FU Shown</th>
                        <th className={TH}>Resched</th>
                        <th className={TH}>Resched Shown</th>
                        <th className={TH}>Offers</th>
                        <th className={TH}>Closed</th>
                        <th className={TH}>Deposits</th>
                        <th className={TH}>Cash</th>
                        <th className={TH}>Revenue</th>
                        <th className={`${TH} border-l border-zinc-800`}>Slot Util</th>
                        <th className={TH}>Show %</th>
                        <th className={TH}>Cancel %</th>
                        <th className={TH}>Offer %</th>
                        <th className={TH}>Close %</th>
                        <th className={TH}>$/Booking</th>
                        <th className={TH}>Rev/Booking</th>
                        <th className={TH}>Collection</th>
                        <th className={TH}>Resched Show</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Grand total at the very top */}
                      {totals && byTeam.length > 1 && (
                        <tr className="bg-zinc-800/60 font-semibold border-b-2 border-zinc-700">
                          <td className={TD} />
                          <td className={`${TD_L} text-zinc-300 text-xs uppercase tracking-wider font-bold sticky left-0 bg-zinc-800/80`}>All Teams Total</td>
                          <td className={TD}>{totals.slots}</td>
                          <td className={TD}>{totals.booked}</td>
                          <td className={TD}>{totals.shown}</td>
                          <td className={TD}>{totals.cancelled}</td>
                          <td className={TD}>{totals.fuSched}</td>
                          <td className={TD}>{totals.fuShown}</td>
                          <td className={TD}>{totals.rescMade}</td>
                          <td className={TD}>{totals.rescShown}</td>
                          <td className={TD}>{totals.offers}</td>
                          <td className={TD}>{totals.closed}</td>
                          <td className={`${TD} text-white font-semibold`}>{fmtMoney(totals.deposits)}</td>
                          <td className={`${TD} text-white font-semibold`}>{fmtMoney(totals.cash)}</td>
                          <td className={`${TD} text-white font-semibold`}>{fmtMoney(totals.revenue)}</td>
                          <td className={`${TD} border-l border-zinc-700 font-semibold ${pctColor(totals.slotUtil)}`}>{fmt(totals.slotUtil)}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.showPct)}`}>{fmt(totals.showPct)}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.cancelPct ? 100 - totals.cancelPct : null, 60, 90)}`}>{fmt(totals.cancelPct)}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.offerPct)}`}>{fmt(totals.offerPct)}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.closePct, 20, 40)}`}>{fmt(totals.closePct)}</td>
                          <td className={TD}>{totals.cashPerBook !== null ? fmtMoney(totals.cashPerBook) : "–"}</td>
                          <td className={TD}>{totals.revPerBook !== null ? fmtMoney(totals.revPerBook) : "–"}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.collection)}`}>{fmt(totals.collection)}</td>
                          <td className={`${TD} font-semibold ${pctColor(totals.rescShowPct)}`}>{fmt(totals.rescShowPct)}</td>
                        </tr>
                      )}

                      {byTeam.map(({ teamName, dates }) => {
                        const teamRows = dates.flatMap(d => d.rows);
                        const teamTotal = aggregate(teamRows);
                        return (
                          <>
                            {/* Team header */}
                            <tr key={`team-${teamName}`} className="bg-zinc-950">
                              <td colSpan={23} className="px-4 pt-5 pb-1.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getTheme(teamName).primary }} />
                                  <span className="text-sm font-bold text-white">{teamName}</span>
                                  <span className="text-xs text-zinc-600">{teamRows.length} submission{teamRows.length !== 1 ? "s" : ""}</span>
                                  <div className="h-px flex-1" style={{ backgroundColor: getTheme(teamName).borderColor }} />
                                </div>
                              </td>
                            </tr>

                            {/* Team total — right after header */}
                            <tr className="bg-zinc-800/50 border-b border-zinc-700/60">
                              <td className={TD} />
                              <td className={`${TD_L} text-xs font-bold uppercase tracking-wider sticky left-0 bg-zinc-800/70`} style={{ color: getTheme(teamName).primary }}>{teamName} Total</td>
                              <td className={TD}>{teamTotal.slots}</td>
                              <td className={TD}>{teamTotal.booked}</td>
                              <td className={TD}>{teamTotal.shown}</td>
                              <td className={TD}>{teamTotal.cancelled}</td>
                              <td className={TD}>{teamTotal.fuSched}</td>
                              <td className={TD}>{teamTotal.fuShown}</td>
                              <td className={TD}>{teamTotal.rescMade}</td>
                              <td className={TD}>{teamTotal.rescShown}</td>
                              <td className={TD}>{teamTotal.offers}</td>
                              <td className={TD}>{teamTotal.closed}</td>
                              <td className={`${TD} text-white font-semibold`}>{fmtMoney(teamTotal.deposits)}</td>
                              <td className={`${TD} text-white font-semibold`}>{fmtMoney(teamTotal.cash)}</td>
                              <td className={`${TD} text-white font-semibold`}>{fmtMoney(teamTotal.revenue)}</td>
                              <td className={`${TD} border-l border-zinc-700 font-semibold ${pctColor(teamTotal.slotUtil)}`}>{fmt(teamTotal.slotUtil)}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.showPct)}`}>{fmt(teamTotal.showPct)}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.cancelPct ? 100 - teamTotal.cancelPct : null, 60, 90)}`}>{fmt(teamTotal.cancelPct)}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.offerPct)}`}>{fmt(teamTotal.offerPct)}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.closePct, 20, 40)}`}>{fmt(teamTotal.closePct)}</td>
                              <td className={TD}>{teamTotal.cashPerBook !== null ? fmtMoney(teamTotal.cashPerBook) : "–"}</td>
                              <td className={TD}>{teamTotal.revPerBook !== null ? fmtMoney(teamTotal.revPerBook) : "–"}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.collection)}`}>{fmt(teamTotal.collection)}</td>
                              <td className={`${TD} font-semibold ${pctColor(teamTotal.rescShowPct)}`}>{fmt(teamTotal.rescShowPct)}</td>
                            </tr>

                            {/* Individual rows — flat, date shown inline */}
                            {dates.flatMap(({ date, rows: dayRows }) => {
                              const dayTotal = aggregate(dayRows);
                              return [
                                ...dayRows.map((row, i) => {
                                  // find original submission index for editing
                                  const subIdx = filtered.findIndex(s => s.name === row.name && s.team === row.team && new Date(s.submittedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) === row.date);
                                  const globalIdx = submissions.indexOf(filtered[subIdx]);
                                  return (
                                    <DataRow
                                      key={`${teamName}-${date}-${i}`}
                                      row={row}
                                      onEdit={() => setEditing({ submission: filtered[subIdx], index: globalIdx })}
                                    />
                                  );
                                }),
                                ...(uniqueDates === 1 && dayRows.length > 1
                                  ? [<DataRow key={`${teamName}-${date}-total`} row={dayTotal as Row} isTotal />]
                                  : []),
                              ];
                            })}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          submission={editing.submission}
          index={editing.index}
          accentColor={theme.primary}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setSubmissions(prev => prev.map((s, i) => i === editing.index ? { ...s, ...updated } : s));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
