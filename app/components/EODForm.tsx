"use client";

import { useState, useEffect, useRef } from "react";
import { getTheme, DEFAULT_THEME } from "../lib/teamBrands";

type FieldType = "text" | "number" | "select" | "currency" | "date";

interface Field {
  id: string;
  question: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  prefix?: string;
}

const TEAM_ROSTER: Record<string, string[]> = {
  "Brandify": ["Noah", "Trevor"],
  "Swingtradinglab": ["Ryan", "Ben", "Jake", "Mason"],
  "Home Service Experts": ["Adam", "Chandler", "Jonathan", "William"],
  "Collective Shift": ["Reece", "Josh", "Paul"],
  "Deal Flip Formula": ["Ben", "Darwin"],
  "Vibecoding Accelerator": [],
  "RB Launch": ["Rodrigo", "Ethan", "Christian", "Daniel", "Michail"],
};

const FIELDS: Field[] = [
  {
    id: "team",
    question: "What team are you on?",
    type: "select",
    options: ["Brandify", "Swingtradinglab", "Home Service Experts", "Collective Shift", "Deal Flip Formula", "Vibecoding Accelerator", "RB Launch"],
  },
  {
    id: "name",
    question: "What is your name?",
    type: "select",
    options: [], // populated dynamically based on team
  },
  {
    id: "date",
    question: "What is today's date?",
    type: "date" as FieldType,
    placeholder: "",
  },
  {
    id: "slots_open",
    question: "How many slots were open today?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "calls_booked",
    question: "How many calls were booked on your calendar?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "calls_shown",
    question: "How many calls were shown?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "calls_cancelled",
    question: "How many calls were cancelled?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "followup_scheduled",
    question: "How many follow-up calls did you schedule?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "followup_shown",
    question: "How many follow-up calls were shown?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "reschedules_made",
    question: "How many reschedules did you make?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "reschedules_shown",
    question: "How many reschedules were shown?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "offers_given",
    question: "How many offers did you give?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "deposits_taken",
    question: "How much in deposits did you take?",
    type: "currency",
    placeholder: "0",
    prefix: "$",
  },
  {
    id: "deals_closed",
    question: "How many deals did you close?",
    type: "number",
    placeholder: "0",
  },
  {
    id: "cash_collected",
    question: "How much cash was collected?",
    type: "currency",
    placeholder: "0",
    prefix: "$",
  },
  {
    id: "revenue_generated",
    question: "How much revenue did you generate?",
    type: "currency",
    placeholder: "0",
    prefix: "$",
  },
];

export default function EODForm() {
  // Pre-fill team from portal session and skip the team question
  const storedTeam = typeof window !== "undefined" ? localStorage.getItem("slings_team") || "" : "";
  const theme = getTheme(storedTeam) ?? DEFAULT_THEME;
  const ACTIVE_FIELDS = storedTeam ? FIELDS.filter(f => f.id !== "team") : FIELDS;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    storedTeam ? { team: storedTeam } : {}
  );
  const [currentValue, setCurrentValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rawField = ACTIVE_FIELDS[step];
  const field = rawField.id === "name"
    ? { ...rawField, options: TEAM_ROSTER[answers.team] ?? [], type: (TEAM_ROSTER[answers.team]?.length ? "select" : "text") as FieldType }
    : rawField;
  const progress = ((step) / ACTIVE_FIELDS.length) * 100;
  const isLast = step === ACTIVE_FIELDS.length - 1;

  useEffect(() => {
    if (field?.type !== "select") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (field?.id === "date" && !answers["date"]) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setCurrentValue(`${yyyy}-${mm}-${dd}`);
    } else {
      setCurrentValue(answers[field?.id] ?? "");
    }
  }, [step]);

  function canAdvance() {
    if (field.type === "select") return !!currentValue;
    return currentValue.trim() !== "";
  }

  function advance() {
    if (!canAdvance()) return;
    setAnswers((prev) => ({ ...prev, [field.id]: currentValue }));

    if (isLast) {
      handleSubmit({ ...answers, [field.id]: currentValue });
      return;
    }

    setStep((s) => s + 1);
  }

  function goBack() {
    if (step === 0) return;
    setAnswers((prev) => ({ ...prev, [field.id]: currentValue }));
    setStep((s) => s - 1);
  }

  async function handleSubmit(finalAnswers: Record<string, string>) {
    setSubmitting(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalAnswers, submittedAt: new Date().toISOString() }),
      });
    } catch {
      // still show success even if save fails
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") advance();
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
          <p className="text-zinc-400 text-lg mb-2">
            Great work today, <span className="text-white font-medium">{answers.name || "closer"}</span>.
          </p>
          <p className="text-zinc-500 mb-10">Your EOD report has been submitted.</p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left max-w-sm mx-auto mb-8">
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-2">
              {ACTIVE_FIELDS.filter(f => f.type === "number" || f.type === "currency").map(f => (
                <div key={f.id} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{f.question.replace("How many ", "").replace("How much ", "").replace("did you ", "").replace("were ", "").replace("?", "")}</span>
                  <span className="text-white font-medium">
                    {f.prefix}{answers[f.id] || "0"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => { setStep(0); setAnswers({}); setCurrentValue(""); setSubmitted(false); }}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Submit another report
            </button>
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
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: theme.primary }}
        />
      </div>

      {/* Step counter */}
      <div className="fixed top-4 right-6 text-zinc-500 text-sm z-10">
        {step + 1} / {ACTIVE_FIELDS.length}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={goBack}
          className="fixed top-3 left-6 transition-colors z-10 flex items-center gap-1.5 text-sm"
          style={{ color: theme.primary, opacity: 0.7 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl slide-up" key={step}>
          {/* Question number badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-sm font-bold" style={{ color: theme.primary }}>{step + 1}</span>
            <svg className="w-3.5 h-3.5" style={{ color: theme.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Question */}
          <h2 className="text-3xl font-semibold text-white mb-8 leading-snug">
            {field.question}
          </h2>

          {/* Input */}
          {field.type === "select" ? (
            <div className="space-y-3">
              {field.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setCurrentValue(opt); }}
                  onDoubleClick={() => { setCurrentValue(opt); advance(); }}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 text-base ${
                    currentValue === opt
                      ? "text-white"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"
                  }`}
                  style={currentValue === opt ? { borderColor: theme.primary, backgroundColor: theme.bgTint } : {}}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              {field.prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl font-medium pointer-events-none">
                  {field.prefix}
                </span>
              )}
              <input
                ref={inputRef}
                type={field.type === "currency" ? "number" : field.type === "date" ? "date" : field.type}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={field.placeholder}
                min={field.type === "number" || field.type === "currency" ? "0" : undefined}
                className={`w-full bg-transparent border-b-2 border-zinc-700 outline-none text-white text-2xl py-3 transition-colors placeholder-zinc-700 ${field.prefix ? "pl-8" : "pl-0"}`}
                onFocus={e => (e.target.style.borderColor = theme.primary)}
                onBlur={e => (e.target.style.borderColor = currentValue ? theme.primary : "#3f3f46")}
              />
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={advance}
              disabled={!canAdvance() || submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                canAdvance() && !submitting ? "" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
              style={canAdvance() && !submitting ? { backgroundColor: theme.primary, color: theme.textOnPrimary } : {}}
            >
              {submitting ? "Submitting..." : isLast ? "Submit" : "OK"}
              {!submitting && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-zinc-600 text-xs">
              press <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-xs">Enter ↵</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
