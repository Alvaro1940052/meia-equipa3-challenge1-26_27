import Link from "next/link";

export type PrologMode = "inference" | "evaluate";

const MODES: { id: PrologMode; label: string; hint: string }[] = [
  { id: "inference", label: "Inferência passo a passo", hint: "Factos, regras e explicações" },
  { id: "evaluate", label: "Avaliação rápida", hint: "Uma decisão a partir de um valor" },
];

export function resolveMode(param: string | string[] | undefined): PrologMode {
  const value = Array.isArray(param) ? param[0] : param;
  return value === "evaluate" ? "evaluate" : "inference";
}

export default function PrologModeSwitch({ active }: { active: PrologMode }) {
  return (
    <nav className="mode-switch" aria-label="Modo do motor Prolog">
      {MODES.map((mode) => (
        <Link
          key={mode.id}
          href={`/?motor=prolog&modo=${mode.id}`}
          scroll={false}
          className={`mode-option ${mode.id === active ? "active" : ""}`}
          aria-current={mode.id === active ? "page" : undefined}
        >
          <strong>{mode.label}</strong>
          <small>{mode.hint}</small>
        </Link>
      ))}
    </nav>
  );
}
