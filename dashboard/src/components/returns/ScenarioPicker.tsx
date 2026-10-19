import ErrorBanner from "@/components/shared/ErrorBanner";
import { useLocale } from "@/contexts/LocaleContext";
import type { CenarioExemploResponse } from "@/types/returns";

export const SCENARIO_TITLES_EN: Record<number, string> = {
  1: "Mainline Store Size Exchange with Loose Tags within 29 Days",
  2: "Online Afterpay Purchase Requesting Store Exchange Exception with Escalation",
  3: "Outlet Blind Gift Return without Proof of Purchase",
  4: "Manufacturing Defect on Altered / Hemmed Jeans within 10 Days",
  5: "Wholesale Brand Garment (Signature) Return Refusal",
  6: "Biohazard / Soiled Garment Immediate Counter Refusal with Quarantine",
  7: "Canadian Store Interac Debit Return without Physical Card Present",
  8: "Price Adjustment Request at 13 Days with Receipt Photograph",
  9: "Outlet Bodywear Package Disposition under Hygiene Policy",
  10: "Online PayPal Return during Returns Portal Outage",
};

export default function ScenarioPicker({
  scenarios,
  selectedId,
  error,
  onSelect,
  onRetry,
}: {
  scenarios: CenarioExemploResponse[] | null;
  selectedId: number | null;
  error: string | null;
  onSelect: (scenario: CenarioExemploResponse) => void;
  onRetry: () => void;
}) {
  const { locale } = useLocale();

  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;
  if (!scenarios) {
    return (
      <p className="field-hint">
        {locale === "en" ? "Loading scenarios..." : "A carregar cenários..."}
      </p>
    );
  }

  return (
    <ul className="scenario-list">
      {scenarios.map((scenario) => {
        const title =
          locale === "en" && SCENARIO_TITLES_EN[scenario.id]
            ? SCENARIO_TITLES_EN[scenario.id]
            : scenario.titulo;

        return (
          <li key={scenario.id}>
            <button
              type="button"
              className={`scenario-card ${scenario.id === selectedId ? "active" : ""}`}
              aria-pressed={scenario.id === selectedId}
              onClick={() => onSelect(scenario)}
            >
              <span className="scenario-number font-mono font-bold tabular-nums">{scenario.id}</span>
              <span className="scenario-title font-sans font-bold">{title}</span>
              {scenario.aValidar.length > 0 && (
                <span className="tag-pending font-sans">
                  {locale === "en" ? "pending validation" : "a validar"}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
