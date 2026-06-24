"use client";

import { useState, useEffect, useRef } from "react";
import { getTheme, DEFAULT_THEME } from "../lib/teamBrands";

type FieldType = "text" | "number" | "currency" | "date" | "select";

interface Field {
  id: string;
  question: string;
  type: FieldType;
  placeholder?: string;
  prefix?: string;
}

const FIELDS: Field[] = [
  { id: "date", question: "What is today's date?", type: "date" },
  { id: "dials", question: "How many dials did you make?", type: "number", placeholder: "0" },
  { id: "connections", question: "How many connections did you make?", type: "number", placeholder: "0" },
  { id: "conversations", question: "How many conversations did you have?", type: "number", placeholder: "0" },
  { id: "quality_conversations", question: "How many quality conversations did you have?", type: "number", placeholder: "0" },
  { id: "appointments_set", question: "How many appointments did you set?", type: "number", placeholder: "0" },
  { id: "sets_showed", question: "How many sets showed?", type: "number", placeholder: "0" },
  { id: "confirmed_triaged", question: "How many confirmed triaged?", type: "number", placeholder: "0" },
  { id: "triaged_showed", question: "How many triaged showed?", type: "number", placeholder: "0" },
  { id: "offers_given_lt", question: "How many offers were given on low ticket?", type: "number", placeholder: "0" },
  { id: "lt_deals_closed", question: "How many low ticket deals did you close?", type: "number", placeholder: "0" },
  { id: "ht_deals_closed", question: "How many high ticket deals did you close?", type: "number", placeholder: "0" },
  { id: "talk_time", question: "What was your total talk time (in seconds)?", type: "number", placeholder: "0" },
  { id: "cash_ht", question: "How much cash was collected (HT)?", type: "currency", placeholder: "0", prefix: "$" },
  { id: "revenue_ht", question: "How much revenue was generated (HT)?", type: "currency", placeholder: "0", prefix: "$" },
  { id: "cash_lt", question: "How much cash was collected (LT)?", type: "currency", placeholder: "0", prefix: "$" },
  { id: "revenue_lt", question: "How much revenue was generated (LT)?", type: "currency", placeholder: "0", prefix: "$" },
];

export default function SetterEODForm() {
  const storedTeam = typeof window !== "undefined" ? localStorage.getItem("slings_team") || "" : "";
  const storedName = typeof window !== "undefined" ? localStorage.getItem("slings_name") || "" : "";
  const theme = getTheme(storedTeam) ?? DEFAULT_THEME;

  const [roster, setRoster] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    team: storedTeam,
    name: storedName,
  });
  const [currentValue, setCurrentValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Name selection step (0) then all FIELDS
  const needsName = !storedName;
  const totalSteps = needsName ? FIELDS.length + 1 : FIELDS.length;
  const isNameStep = needsName && step === 0;
  const fieldIndex = needsName ? step - 1 : step;
  const field = isNameStep ? null : FIELDS[fieldIndex];
  const progress = (step / totalSteps) * 100;
  const isLast = step === totalSteps - 1;

  useEffect(() => {
    if (storedTeam) {
      fetch("/api/roster?role=setter").then(r => r.json()).then((data: { team: string; name: string }[]) => {
        setRoster(data.filter(r => r.team === storedTeam).map(r => r.name));
      });
    }
  }, [storedTeam]);

  useEffect(() => {
    if (!isNameStep && field?.type !== "select") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!isNameStep && field?.id === "date" && !answers["date"]) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setCurrentValue(`${yyyy}-${mm}-${dd}`);
    } else {
      setCurrentValue(isNameStep ? (answers["name"] ?? "") : (answers[field?.id ?? ""] ?? ""));
    }
  }, [step]);

  function canAdvance() {
    return currentValue.trim() !== "";
  }

  function advance() {
    if (!canAdvance()) return;
    const key = isNameStep ? "name" : field!.id;
    const updated = { ...answers, [key]: currentValue };
    setAnswers(updated);
    if (isNameStep) localStorage.setItem("slings_name", currentValue);

    if (isLast) {
      handleSubmit(updated);
      return;
    }
    setStep(s => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    const key = isNameStep ? "name" : field!.id;
    setAnswers(prev => ({ ...prev, [key]: currentValue }));
    setStep(s => s - 1);
  }

  async function handleSubmit(finalAnswers: Record<string, string>) {
    setSubmitting(true);
    try {
      await fetch("/api/setter/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalAnswers, submittedAt: new Date().toISOString() }),
      });
    } catch { }
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
        <div className="text-center slide-up">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: theme.primary }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">That's a wrap!</h1>
          <p className="text-zinc-400 text-lg mb-2">Great work today, <span className="text-white font-medium">{answers.name || "setter"}</span>.</p>
          <p className="text-zinc-500 mb-10">Your setter EOD has been submitted.</p>
          <div className="flex items-center gap-4 justify-center">
            <button onClick={() => { setStep(0); setAnswers({ team: storedTeam, name: storedName }); setCurrentValue(""); setSubmitted(false); }}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Submit another</button>
            <span className="text-zinc-700">·</span>
            <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Back to portal</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800 z-10">
        <div className="h-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, backgroundColor: theme.primary }} />
      </div>

      <div className="fixed top-4 right-6 text-zinc-500 text-sm z-10">{step + 1} / {totalSteps}</div>

      {step > 0 && (
        <button onClick={goBack} className="fixed top-3 left-6 z-10 flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: theme.primary, opacity: 0.7 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl slide-up" key={step}>
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-sm font-bold" style={{ color: theme.primary }}>{step + 1}</span>
            <svg className="w-3.5 h-3.5" style={{ color: theme.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-8 leading-snug">
            {isNameStep ? "What is your name?" : field!.question}
          </h2>

          {isNameStep && roster.length > 0 ? (
            <div className="space-y-3">
              {roster.map(name => (
                <button key={name} onClick={() => setCurrentValue(name)} onDoubleClick={() => { setCurrentValue(name); advance(); }}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 text-base ${currentValue === name ? "text-white" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"}`}
                  style={currentValue === name ? { borderColor: theme.primary, backgroundColor: theme.bgTint } : {}}>
                  {name}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              {!isNameStep && field!.prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-medium pointer-events-none">{field!.prefix}</span>
              )}
              <input
                ref={inputRef}
                type={!isNameStep && (field!.type === "currency" || field!.type === "number") ? "number" : !isNameStep && field!.type === "date" ? "date" : "text"}
                value={currentValue}
                onChange={e => setCurrentValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && advance()}
                placeholder={isNameStep ? "Your name..." : field!.placeholder}
                min={!isNameStep && (field!.type === "number" || field!.type === "currency") ? "0" : undefined}
                className={`w-full bg-transparent border-b-2 border-zinc-700 outline-none text-white text-2xl py-3 transition-colors placeholder-zinc-700 ${!isNameStep && field!.prefix ? "pl-8" : "pl-0"}`}
                onFocus={e => (e.target.style.borderColor = theme.primary)}
                onBlur={e => (e.target.style.borderColor = currentValue ? theme.primary : "#3f3f46")}
              />
            </div>
          )}

          <div className="mt-10 flex items-center gap-4">
            <button onClick={advance} disabled={!canAdvance() || submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${canAdvance() && !submitting ? "" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"}`}
              style={canAdvance() && !submitting ? { backgroundColor: theme.primary, color: theme.textOnPrimary } : {}}>
              {submitting ? "Submitting..." : isLast ? "Submit" : "OK"}
              {!submitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-zinc-600 text-xs">press <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-xs">Enter ↵</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
