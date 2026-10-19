import type { Locale } from "@/contexts/LocaleContext";

export interface StepInputItem {
  code: string; // ex: 'IN-001'
  label: string; // ex: '01 / Jurisdição Territorial' ou '01 / Territorial Jurisdiction'
}

export const INPUT_LABELS: Record<string, { pt: string; en: string }> = {
  "IN-001": {
    pt: "01 / Jurisdição Territorial",
    en: "01 / Territorial Jurisdiction",
  },
  "IN-002": {
    pt: "02 / Formato Comercial da Loja",
    en: "02 / Store Commercial Format",
  },
  "IN-003": {
    pt: "03 / Canal de Compra Original",
    en: "03 / Original Purchase Channel",
  },
  "IN-004": {
    pt: "02 / Comprovativo Apresentado",
    en: "02 / Proof of Purchase Presented",
  },
  "IN-005": {
    pt: "01 / Tipo de Pedido Formulado",
    en: "01 / Customer Request Type",
  },
  "IN-006": {
    pt: "03 / Prazo Decorrido da Compra",
    en: "03 / Elapsed Days Since Purchase",
  },
  "IN-007": {
    pt: "01 / Identificação & Marca",
    en: "01 / Product Identification & Brand",
  },
  "IN-008": {
    pt: "02 / Estado Físico do Artigo",
    en: "02 / Item Physical Condition",
  },
  "IN-009": {
    pt: "02 / Meio de Pagamento Original",
    en: "02 / Original Payment Tender",
  },
  "IN-010": {
    pt: "03 / Possibilidade de Revenda",
    en: "03 / Resale Feasibility",
  },
  "EP-001": {
    pt: "01 / Modalidade de Troca",
    en: "01 / Exchange Mode",
  },
  "EX-002": {
    pt: "02 / Situação do Cliente no Balcão",
    en: "02 / Counter Dispute Status",
  },
  "EX-001": {
    pt: "03 / Exceção da Gerência",
    en: "03 / Store Manager Override",
  },
  "EX-002-S5": {
    pt: "01 / Situação do Cliente no Balcão",
    en: "01 / Counter Dispute Status",
  },
  "EX-001-S5": {
    pt: "02 / Exceção da Gerência",
    en: "02 / Store Manager Override",
  },
};

function formatItem(code: string, labelKey: string, locale: Locale): StepInputItem {
  const item = INPUT_LABELS[labelKey] || INPUT_LABELS[code];
  const text = item ? (locale === "en" ? item.en : item.pt) : code;
  return { code, label: text };
}

export const STEP_INPUT_MAPPING: Record<number, StepInputItem[]> = {
  2: [
    { code: "IN-001", label: "01 / Jurisdição Territorial" },
    { code: "IN-002", label: "02 / Formato Comercial da Loja" },
    { code: "IN-003", label: "03 / Canal de Compra Original" },
  ],
  3: [
    { code: "IN-007", label: "01 / Identificação & Marca" },
    { code: "IN-008", label: "02 / Estado Físico do Artigo" },
    { code: "IN-010", label: "03 / Possibilidade de Revenda" },
  ],
  4: [
    { code: "IN-005", label: "01 / Tipo de Pedido Formulado" },
    { code: "IN-004", label: "02 / Comprovativo Apresentado" },
    { code: "IN-006", label: "03 / Prazo Decorrido da Compra" },
  ],
  5: [
    { code: "EP-001", label: "01 / Modalidade de Troca" },
    { code: "EX-002", label: "02 / Situação do Cliente no Balcão" },
    { code: "EX-001", label: "03 / Exceção da Gerência" },
  ],
  6: [
    { code: "IN-009", label: "02 / Meio de Pagamento Original" },
  ],
};

export function getInputsForStep(
  stepNumber: number,
  requestType?: string,
  physicalCondition?: string | null,
  locale: Locale = "pt"
): StepInputItem[] {
  if (stepNumber === 2) {
    return [
      formatItem("IN-001", "IN-001", locale),
      formatItem("IN-002", "IN-002", locale),
      formatItem("IN-003", "IN-003", locale),
    ];
  }
  if (stepNumber === 3) {
    const isResellApplicable =
      !physicalCondition ||
      physicalCondition === "NOVO_ETIQUETAS_SOLTAS" ||
      physicalCondition === "NOVO_SEM_ETIQUETAS";
    if (isResellApplicable) {
      return [
        formatItem("IN-007", "IN-007", locale),
        formatItem("IN-008", "IN-008", locale),
        formatItem("IN-010", "IN-010", locale),
      ];
    }
    return [
      formatItem("IN-007", "IN-007", locale),
      formatItem("IN-008", "IN-008", locale),
    ];
  }
  if (stepNumber === 4) {
    return [
      formatItem("IN-005", "IN-005", locale),
      formatItem("IN-004", "IN-004", locale),
      formatItem("IN-006", "IN-006", locale),
    ];
  }
  if (stepNumber === 5) {
    if (requestType === "TROCA") {
      return [
        formatItem("EP-001", "EP-001", locale),
        formatItem("EX-002", "EX-002", locale),
        formatItem("EX-001", "EX-001", locale),
      ];
    }
    return [
      formatItem("EX-002", "EX-002-S5", locale),
      formatItem("EX-001", "EX-001-S5", locale),
    ];
  }
  if (stepNumber === 6) {
    return [formatItem("IN-009", "IN-009", locale)];
  }
  return STEP_INPUT_MAPPING[stepNumber] || [];
}
