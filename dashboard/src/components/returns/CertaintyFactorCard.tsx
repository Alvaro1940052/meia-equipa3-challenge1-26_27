"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { CfTraceStep, UncertaintyCf } from "@/types/returns";

function roundCf(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatCf(value: number): string {
  const rounded = roundCf(value);
  const text = Math.abs(rounded).toFixed(2);
  if (rounded > 0) return `+${text}`;
  if (rounded < 0) return `-${text}`;
  return "0.00";
}

function formatOperand(value: number): string {
  return roundCf(value).toFixed(2);
}

function splitBilingual(text: string, locale: string): { primary: string; secondary: string } {
  const match = text.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!match) return { primary: text, secondary: "" };
  const english = match[1].trim();
  const portuguese = match[2].trim();
  return locale === "en"
    ? { primary: english, secondary: portuguese }
    : { primary: portuguese, secondary: english };
}

function formulaFor(previous: number | null, step: CfTraceStep): string {
  if (previous === null || step.combination === "initial") {
    return `CF₀ = ${formatOperand(step.runningCf)}`;
  }
  const oldCf = formatOperand(previous);
  const newCf = formatOperand(step.cf);
  const next = formatOperand(step.runningCf);
  if (step.combination === "negative") {
    return `CF_revised = ${oldCf} + ${newCf} × (1 + ${oldCf}) = ${next}`;
  }
  if (step.combination === "conflict") {
    return `CF_revised = (${oldCf} + ${newCf}) / (1 − min(|${oldCf}|, |${newCf}|)) = ${next}`;
  }
  return `CF_revised = ${oldCf} + ${newCf} × (1 − ${oldCf}) = ${next}`;
}

export default function CertaintyFactorCard({ advice }: { advice: UncertaintyCf }) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const score = Number.isFinite(advice.finalCf) ? advice.finalCf : 0;
  const clamped = Math.max(-1, Math.min(1, score));
  const marker = ((clamped + 1) / 2) * 100;
  const phrase = splitBilingual(advice.linguisticLabel, locale);
  const trace = advice.cfTrace?.length ? advice.cfTrace : advice.cfFactorsFired ?? [];
  const review = advice.context === "manager_review";
  const positive = score >= 0.4;
  const negative = score <= -0.21;
  const tone = positive
    ? "border-emerald-200 bg-emerald-50/40"
    : negative
      ? "border-rose-200 bg-rose-50/40"
      : "border-amber-200 bg-amber-50/50";
  const scoreTone = positive ? "text-emerald-800" : negative ? "text-rose-800" : "text-amber-900";
  const fill = positive ? "bg-emerald-500" : negative ? "bg-rose-500" : "bg-amber-500";

  return (
    <section className={`w-full rounded-2xl border shadow-xs p-5 sm:p-6 flex flex-col gap-5 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {advice.source ?? "EX-001"}
          </p>
          <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {isEn
              ? "MYCIN Certainty Factor (EX-001 Exception Advisor)"
              : "Fator de Certeza MYCIN (Conselheiro de Exceção EX-001)"}
          </h3>
          <p className="font-sans text-xs text-slate-600">
            {review
              ? isEn
                ? "Advisory score for this manager review. The deterministic verdict is unchanged."
                : "Pontuação consultiva desta revisão. O veredito determinístico mantém-se."
              : isEn
                ? "Auxiliary confidence score. The deterministic verdict is unchanged."
                : "Pontuação auxiliar de confiança. O veredito determinístico mantém-se."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`font-mono text-3xl font-bold tabular-nums ${scoreTone}`}>
            CF: {formatCf(score)}
          </span>
          <span className="font-sans text-sm font-semibold text-slate-900 text-right">{phrase.primary}</span>
          {phrase.secondary && (
            <span className="font-sans text-xs text-slate-500 text-right">{phrase.secondary}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          className="relative h-3 rounded-full bg-white/80 border border-slate-200"
          role="meter"
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={Number(clamped.toFixed(2))}
          aria-label={isEn ? "Certainty factor from -1 to +1" : "Fator de certeza de -1 a +1"}
        >
          <div
            className={`absolute top-0 h-full ${fill}`}
            style={{
              left: clamped >= 0 ? "50%" : `${marker}%`,
              width: `${(Math.abs(clamped) / 2) * 100}%`,
            }}
          />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-400" />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-sm"
            style={{ left: `${marker}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
          <span>-1.0</span>
          <span>0</span>
          <span>+1.0</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">
          {isEn ? "Combination trace" : "Traço da combinação"}
        </h4>
        <p className="font-sans text-[11px] text-slate-500">
          {isEn
            ? "Each running total is rounded to 2 decimals, matching the engine."
            : "Cada total intermédio é arredondado a 2 casas decimais, como no motor."}
        </p>
        {trace.length === 0 ? (
          <p className="font-sans text-sm text-slate-600">
            {isEn ? "No evidence factors fired." : "Nenhum fator de evidência disparou."}
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {trace.map((step, index) => {
              const previous = index === 0 ? null : trace[index - 1].runningCf;
              const evidence = splitBilingual(step.description, locale);
              const contributed = step.cf >= 0;
              return (
                <li
                  key={`${step.evidence}-${index}`}
                  className="rounded-xl bg-white/80 border border-slate-200 px-3 py-2.5 flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-sans text-sm font-semibold text-slate-900">
                      {evidence.primary || step.evidence}
                    </span>
                    <span className={`font-mono text-sm font-bold tabular-nums shrink-0 ${contributed ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatCf(step.cf)}
                    </span>
                  </div>
                  <p className="font-mono text-[12px] text-slate-700 tabular-nums break-words">
                    {formulaFor(previous, step)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
