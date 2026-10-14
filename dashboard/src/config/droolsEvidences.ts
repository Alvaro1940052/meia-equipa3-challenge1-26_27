export type EvidenceKey =
  | "bloodEar"
  | "earAche"
  | "deafness"
  | "cerebrospinal"
  | "bloodNose"
  | "vomiting"
  | "bloodBrown"
  | "bloodMouth"
  | "bloodCoffee"
  | "bloodAnus"
  | "bloodPenis"
  | "bloodVagina"
  | "headAche";

/** true = sintoma presente. O motor trata qualquer sintoma não confirmado como "não". */
export type Symptoms = Record<EvidenceKey, boolean>;

export interface EvidenceGroup {
  title: string;
  items: { key: EvidenceKey; label: string }[];
}

export const EVIDENCE_GROUPS: EvidenceGroup[] = [
  {
    title: "Ouvido",
    items: [
      { key: "bloodEar", label: "Sangue pelo ouvido" },
      { key: "earAche", label: "Dor de ouvido" },
      { key: "deafness", label: "Perda de audição" },
      { key: "cerebrospinal", label: "Saída de líquido cefalorraquidiano" },
    ],
  },
  {
    title: "Nariz e cabeça",
    items: [
      { key: "bloodNose", label: "Sangue pelo nariz" },
      { key: "headAche", label: "Dor de cabeça intensa" },
    ],
  },
  {
    title: "Boca e sistema digestivo",
    items: [
      { key: "vomiting", label: "Vómitos" },
      { key: "bloodMouth", label: "Sangue pela boca" },
      { key: "bloodBrown", label: "Sangue acastanhado ou escuro" },
      { key: "bloodCoffee", label: "Sangue com aspeto de borra de café" },
      { key: "bloodAnus", label: "Sangue pelo ânus" },
    ],
  },
  {
    title: "Sistema urinário e genital",
    items: [
      { key: "bloodPenis", label: "Sangue na urina (hematúria)" },
      { key: "bloodVagina", label: "Sangue vaginal" },
    ],
  },
];

export const EVIDENCE_LABELS = Object.fromEntries(
  EVIDENCE_GROUPS.flatMap((group) => group.items.map((item) => [item.key, item.label]))
) as Record<EvidenceKey, string>;

export const NO_SYMPTOMS = Object.fromEntries(
  EVIDENCE_GROUPS.flatMap((group) => group.items.map((item) => [item.key, false]))
) as Symptoms;

export interface EvidenceScenario {
  id: string;
  name: string;
  /** Sintomas presentes; todos os outros são "não". */
  present: EvidenceKey[];
}

export const EVIDENCE_SCENARIOS: EvidenceScenario[] = [
  { id: "ear-pain", name: "Sangue no ouvido com dor", present: ["bloodEar", "earAche"] },
  {
    id: "ear-fluid",
    name: "Sangue no ouvido com líquido cefalorraquidiano",
    present: ["bloodEar", "cerebrospinal"],
  },
  { id: "nose", name: "Sangue pelo nariz", present: ["bloodNose"] },
  {
    id: "vomit-blood",
    name: "Vómitos com sangue escuro",
    present: ["bloodMouth", "bloodBrown", "vomiting"],
  },
  { id: "mouth", name: "Sangue pela boca, sem vómitos", present: ["bloodMouth"] },
  { id: "vaginal", name: "Sangue vaginal", present: ["bloodVagina"] },
  { id: "urine", name: "Sangue na urina", present: ["bloodPenis"] },
  {
    id: "dark-stool",
    name: "Sangue pelo ânus com aspeto de borra de café",
    present: ["bloodAnus", "bloodCoffee"],
  },
  { id: "rectal", name: "Sangue pelo ânus", present: ["bloodAnus"] },
  { id: "inconclusive", name: "Só dor de cabeça (sem diagnóstico)", present: ["headAche"] },
];

/** Nomes devolvidos pelo motor (inglês) para apresentação em português. */
export const DIAGNOSIS_LABELS: Record<string, string> = {
  Otorrhagia: "Otorragia",
  "Skull fracture": "Fratura do crânio",
  Epistaxe: "Epistaxe (hemorragia nasal)",
  Hemathese: "Hematémese",
  "Mouth haemorrhage": "Hemorragia da boca",
  Metrorrhagia: "Metrorragia",
  Hematuria: "Hematúria",
  Melena: "Melena",
  "Rectal bleeding": "Hemorragia retal",
};

/** Regra que o motor dispara quando nenhuma conclusão se aplica. */
export const FALLBACK_RULE = "r13_unknown_diagnosis_fallback";

export const HYPOTHESIS_LABELS: Record<string, string> = {
  "upper type": "Tipo superior",
  "lower type": "Tipo inferior",
};
