import type { ReactNode } from "react";

type Tone = "approved" | "rejected" | "info";

/** Decisão em destaque, seguida do conteúdo de justificação passado como children. */
export default function ResultSummary({
  eyebrow,
  headline,
  tone = "approved",
  meta,
  children,
}: {
  eyebrow: string;
  headline: string;
  tone?: Tone;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div className="result-box">
      <div className="presets-label">{eyebrow}</div>
      <div className="result-header">
        <span className={`badge-decision ${tone}`}>{headline}</span>
        {meta && <span className="meta-info">{meta}</span>}
      </div>
      {children}
    </div>
  );
}
