"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TeamLogo, getTheme, DEFAULT_THEME, type TeamTheme } from "../lib/teamBrands";

interface SetterSubmission {
  id?: string;
  team: string;
  name: string;
  date: string;
  dials: string;
  connections: string;
  conversations: string;
  quality_conversations: string;
  appointments_set: string;
  sets_showed: string;
  confirmed_triaged: string;
  triaged_showed: string;
  offers_given_lt: string;
  lt_deals_closed: string;
  ht_deals_closed: string;
  talk_time: string;
  cash_ht: string;
  revenue_ht: string;
  cash_lt: string;
  revenue_lt: string;
  submittedAt: string;
}

const TEAMS = ["All Teams", "Brandify", "Swingtradinglab", "Home Service Experts", "Collective Shift", "Deal Flip Formula", "Vibecoding Accelerator", "RB Launch"];

type DateRange = "this_week" | "this_month" | "last_7" | "last_30" | "this_year" | "all_time";
const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_7", label: "Last 7 Days" },
  { value: "last_30", label: "Last 30 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all_time", label: "All Time" },
];

function getDateBounds(range: DateRange) {
  const now = new Date();
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  let start = new Date(now);
  if (range === "this_week") { const d = now.getDay(); start.setDate(now.getDate() - (d === 0 ? 6 : d - 1)); start.setHours(0,0,0,0); }
  else if (range === "this_month") { start = new Date(now.getFullYear(), now.getMonth(), 1); }
  else if (range === "last_7") { start.setDate(now.getDate() - 6); start.setHours(0,0,0,0); }
  else if (range === "last_30") { start.setDate(now.getDate() - 29); start.setHours(0,0,0,0); }
  else if (range === "this_year") { start = new Date(now.getFullYear(), 0, 1); }
  else { start = new Date(0); }
  return { start, end };
}

function n(v: string | undefined) { return parseFloat(v || "0") || 0; }
function pct(a: number, b: number) { return b ? (a / b) * 100 : null; }
function fmt(v: number | null) { return v === null ? "–" : v.toFixed(1) + "%"; }
function fmtMoney(v: number) { return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 }); }
function pctColor(v: number | null, low = 20, mid = 40) {
  if (v === null) return "text-zinc-600";
  if (v >= mid) return "text-emerald-400";
  if (v >= low) return "text-amber-400";
  return "text-red-400";
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

export default function SetterDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SetterSubmission[]>([]);
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

  useEffect(() => {
    const storedRole = localStorage.getItem("slings_role") as "admin" | "team" | null;
    const storedTeam = localStorage.getItem("slings_team") || "";
    if (!storedRole) { router.push("/"); return; }
    setRole(storedRole);
    setMyTeam(storedTeam);
    if (storedRole === "team") { setTeam(storedTeam); setTheme(getTheme(storedTeam)); }
    fetch("/api/setter/responses").then(r => r.json()).then(d => { setSubmissions(d); setLoading(false); });
  }, [router]);

  const filtered = useMemo(() => {
    const { start, end } = getDateBounds(range);
    return submissions.filter(s => {
      const dateStr = s.date || s.submittedAt?.slice(0, 10);
      const d = new Date(dateStr + "T12:00:00");
      return (team === "All Teams" || s.team === team) &&
             (rep === "All Reps" || s.name === rep) &&
             d >= start && d <= end;
    });
  }, [submissions, team, rep, range]);

  const availableReps = useMemo(() => {
    const t = submissions.filter(s => team === "All Teams" || s.team === team);
    return ["All Reps", ...Array.from(new Set(t.map(s => s.name))).sort()];
  }, [submissions, team]);

  // Aggregate totals
  const totals = useMemo(() => {
    if (!filtered.length) return null;
    const sum = (k: keyof SetterSubmission) => filtered.reduce((a, s) => a + n(s[k] as string), 0);
    const dials = sum("dials"), connections = sum("connections");
    const conversations = sum("conversations"), qualConvos = sum("quality_conversations");
    const apptSet = sum("appointments_set"), setsShowed = sum("sets_showed");
    const triaged = sum("confirmed_triaged"), triagedShowed = sum("triaged_showed");
    const offersLT = sum("offers_given_lt"), ltClosed = sum("lt_deals_closed"), htClosed = sum("ht_deals_closed");
    const talkTime = sum("talk_time");
    const cashHT = sum("cash_ht"), revenueHT = sum("revenue_ht");
    const cashLT = sum("cash_lt"), revenueLT = sum("revenue_lt");
    return {
      dials, connections, conversations, qualConvos, apptSet, setsShowed,
      triaged, triagedShowed, offersLT, ltClosed, htClosed, talkTime,
      cashHT, revenueHT, cashLT, revenueLT,
      connectionRate: pct(connections, dials),
      showRate: pct(setsShowed, apptSet),
      triageShowRate: pct(triagedShowed, triaged),
      closeRate: pct(htClosed, apptSet),
      ltCloseRate: pct(ltClosed, offersLT),
    };
  }, [filtered]);

  const rangeLabel = DATE_RANGES.find(d => d.value === range)?.label ?? "";

  const Dropdown = ({ open, setOpen, label, options, value, onSelect, color }: {
    open: boolean; setOpen: (v: boolean) => void; label: string;
    options: string[]; value: string; onSelect: (v: string) => void; color?: string;
  }) => (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => { const next = !open; setTeamOpen(false); setRepOpen(false); setRangeOpen(false); setOpen(next); }}
        className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm text-zinc-300 hover:text-white transition-all min-w-[130px] justify-between">
        {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
        <span className="truncate max-w-[120px]">{value}</span>
        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-30 max-h-64 overflow-y-auto">
          {options.map(o => (
            <button key={o} onClick={() => { onSelect(o); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === o ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" onClick={() => { setTeamOpen(false); setRepOpen(false); setRangeOpen(false); }}>
      {/* Nav */}
      <div className="border-b border-zinc-800 bg-[#0a0a0a] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {(role === "team" && myTeam) || (role === "admin" && team !== "All Teams") ? (
              <TeamLogo team={role === "team" ? myTeam : team} size={32} />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="font-bold text-base tracking-tight">Slings Inc</span>
                {role === "admin" && <span className="ml-1 text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Admin</span>}
              </div>
            )}
            {/* Toggle between closer/setter dashboard */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-1 ml-2">
              <Link href="/dashboard" className="px-3 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-white transition-colors">Closers</Link>
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-zinc-700 text-white">Setters</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown open={rangeOpen} setOpen={setRangeOpen} label="Range" options={DATE_RANGES.map(d => d.label)} value={rangeLabel} onSelect={v => setRange(DATE_RANGES.find(d => d.label === v)!.value)} />
            {role === "admin" && (
              <Dropdown open={teamOpen} setOpen={setTeamOpen} label="Team" options={TEAMS} value={team}
                color={team !== "All Teams" ? getTheme(team).primary : undefined}
                onSelect={v => { setTeam(v); setRep("All Reps"); setTheme(v !== "All Teams" ? getTheme(v) : DEFAULT_THEME); }} />
            )}
            <Dropdown open={repOpen} setOpen={setRepOpen} label="Rep" options={availableReps} value={rep} onSelect={setRep} />
            <Link href="/setter" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Submit EOD
            </Link>
            <button onClick={() => { localStorage.clear(); router.push("/"); }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors" title="Sign out">
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
            {/* KPI Cards */}
            {totals && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <StatCard label="Connection Rate" value={fmt(totals.connectionRate)} sub={`${totals.connections} / ${totals.dials} dials`} />
                <StatCard label="Outbound Show Rate" value={fmt(totals.showRate)} sub={`${totals.setsShowed} showed / ${totals.apptSet} set`} />
                <StatCard label="Triage Show Rate" value={fmt(totals.triageShowRate)} sub={`${totals.triagedShowed} / ${totals.triaged} triaged`} />
                <StatCard label="HT Close Rate" value={fmt(totals.closeRate)} sub={`${totals.htClosed} closed / ${totals.apptSet} sets`} />
                <StatCard label="LT Close Rate" value={fmt(totals.ltCloseRate)} sub={`${totals.ltClosed} closed / ${totals.offersLT} offered`} />
              </div>
            )}

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <svg className="w-12 h-12 text-zinc-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-zinc-500 font-medium">No submissions found</p>
                <p className="text-zinc-600 text-sm mt-1">Try a different date range or team filter</p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className={TH_L}>Date</th>
                        <th className={TH_L}>Rep</th>
                        {role === "admin" && <th className={TH_L}>Team</th>}
                        <th className={TH}>Dials</th>
                        <th className={TH}>Connects</th>
                        <th className={TH}>Convos</th>
                        <th className={TH}>Qual Convos</th>
                        <th className={TH}>Appts Set</th>
                        <th className={TH}>Sets Showed</th>
                        <th className={TH}>Triaged</th>
                        <th className={TH}>Triage Showed</th>
                        <th className={TH}>Offers LT</th>
                        <th className={TH}>LT Closed</th>
                        <th className={TH}>HT Closed</th>
                        <th className={TH}>Talk Time</th>
                        <th className={TH}>Cash HT</th>
                        <th className={TH}>Rev HT</th>
                        <th className={TH}>Cash LT</th>
                        <th className={TH}>Rev LT</th>
                        <th className={TH}>Connect %</th>
                        <th className={TH}>Show %</th>
                        <th className={TH}>Triage %</th>
                        <th className={TH}>HT Close %</th>
                        <th className={TH}>LT Close %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Totals row */}
                      {totals && (
                        <tr className="border-b-2 border-zinc-700 bg-zinc-900/60 font-semibold">
                          <td className={TD_L + " text-zinc-400 text-xs uppercase tracking-wider"} colSpan={role === "admin" ? 3 : 2}>Total</td>
                          <td className={TD}>{totals.dials}</td>
                          <td className={TD}>{totals.connections}</td>
                          <td className={TD}>{totals.conversations}</td>
                          <td className={TD}>{totals.qualConvos}</td>
                          <td className={TD}>{totals.apptSet}</td>
                          <td className={TD}>{totals.setsShowed}</td>
                          <td className={TD}>{totals.triaged}</td>
                          <td className={TD}>{totals.triagedShowed}</td>
                          <td className={TD}>{totals.offersLT}</td>
                          <td className={TD}>{totals.ltClosed}</td>
                          <td className={TD}>{totals.htClosed}</td>
                          <td className={TD}>{totals.talkTime}</td>
                          <td className={TD}>{fmtMoney(totals.cashHT)}</td>
                          <td className={TD}>{fmtMoney(totals.revenueHT)}</td>
                          <td className={TD}>{fmtMoney(totals.cashLT)}</td>
                          <td className={TD}>{fmtMoney(totals.revenueLT)}</td>
                          <td className={`${TD} ${pctColor(totals.connectionRate)}`}>{fmt(totals.connectionRate)}</td>
                          <td className={`${TD} ${pctColor(totals.showRate)}`}>{fmt(totals.showRate)}</td>
                          <td className={`${TD} ${pctColor(totals.triageShowRate)}`}>{fmt(totals.triageShowRate)}</td>
                          <td className={`${TD} ${pctColor(totals.closeRate)}`}>{fmt(totals.closeRate)}</td>
                          <td className={`${TD} ${pctColor(totals.ltCloseRate)}`}>{fmt(totals.ltCloseRate)}</td>
                        </tr>
                      )}
                      {/* Data rows */}
                      {filtered.map((s, i) => {
                        const dials = n(s.dials), connects = n(s.connections);
                        const apptSet = n(s.appointments_set), setsShowed = n(s.sets_showed);
                        const triaged = n(s.confirmed_triaged), triagedShowed = n(s.triaged_showed);
                        const offersLT = n(s.offers_given_lt), ltClosed = n(s.lt_deals_closed), htClosed = n(s.ht_deals_closed);
                        const dateStr = s.date || s.submittedAt?.slice(0, 10);
                        const displayDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                        return (
                          <tr key={s.id ?? i} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors">
                            <td className={TD_L + " text-zinc-500 text-xs whitespace-nowrap"}>{displayDate}</td>
                            <td className={TD_L + " text-white font-medium"}>{s.name}</td>
                            {role === "admin" && <td className={TD_L + " text-zinc-400 text-xs"}>{s.team}</td>}
                            <td className={TD}>{n(s.dials)}</td>
                            <td className={TD}>{n(s.connections)}</td>
                            <td className={TD}>{n(s.conversations)}</td>
                            <td className={TD}>{n(s.quality_conversations)}</td>
                            <td className={TD}>{n(s.appointments_set)}</td>
                            <td className={TD}>{n(s.sets_showed)}</td>
                            <td className={TD}>{n(s.confirmed_triaged)}</td>
                            <td className={TD}>{n(s.triaged_showed)}</td>
                            <td className={TD}>{n(s.offers_given_lt)}</td>
                            <td className={TD}>{n(s.lt_deals_closed)}</td>
                            <td className={TD}>{n(s.ht_deals_closed)}</td>
                            <td className={TD}>{n(s.talk_time)}</td>
                            <td className={TD}>{fmtMoney(n(s.cash_ht))}</td>
                            <td className={TD}>{fmtMoney(n(s.revenue_ht))}</td>
                            <td className={TD}>{fmtMoney(n(s.cash_lt))}</td>
                            <td className={TD}>{fmtMoney(n(s.revenue_lt))}</td>
                            <td className={`${TD} ${pctColor(pct(connects, dials))}`}>{fmt(pct(connects, dials))}</td>
                            <td className={`${TD} ${pctColor(pct(setsShowed, apptSet))}`}>{fmt(pct(setsShowed, apptSet))}</td>
                            <td className={`${TD} ${pctColor(pct(triagedShowed, triaged))}`}>{fmt(pct(triagedShowed, triaged))}</td>
                            <td className={`${TD} ${pctColor(pct(htClosed, apptSet))}`}>{fmt(pct(htClosed, apptSet))}</td>
                            <td className={`${TD} ${pctColor(pct(ltClosed, offersLT))}`}>{fmt(pct(ltClosed, offersLT))}</td>
                          </tr>
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
    </div>
  );
}
