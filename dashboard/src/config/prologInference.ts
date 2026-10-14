/** Única base de conhecimento oferecida: carregar um nome inexistente apagaria a sessão do motor. */
export const KNOWLEDGE_BASE = "vehicles";

export const INFERENCE_STEPS = [
  { title: "Carregar base", hint: "Carregue os factos e regras" },
  { title: "Executar", hint: "Deixe o motor deduzir factos novos" },
  { title: "Explorar", hint: "Pergunte “como” e “porque não”" },
  { title: "Reiniciar", hint: "Comece de novo quando quiser" },
];

export const RULE_DESCRIPTIONS: Record<number, string> = {
  1: "Transporta passageiros e é ligeiro ⇒ é um carro",
  2: "Transporta mercadorias e é pesado ⇒ é um camião",
  3: "Transporta passageiros e é pesado ⇒ é um autocarro",
  4: "É misto e pesado ⇒ é uma camioneta",
  5: "Lotação acima de 9 ⇒ é pesado",
  6: "Peso acima de 3500 kg ⇒ é pesado",
  7: "Lotação até 9 e peso até 3500 kg ⇒ é ligeiro",
  8: "Transporta mercadorias e passageiros ⇒ é misto",
};

export const WHY_NOT_SUGGESTIONS = [
  "classe(meu_veiculo,ligeiro)",
  "ligeiro(meu_veiculo,carro)",
  "pesado(meu_veiculo,autocarro)",
  "tipo(meu_veiculo,misto)",
];

const PREDICATES: Record<string, string> = {
  lotacao: "Lotação",
  peso: "Peso",
  tipo: "Tipo",
  classe: "Classe",
  pesado: "Pesado",
  ligeiro: "Ligeiro",
};

const WORDS: Record<string, string> = {
  veiculo: "veículo",
  camiao: "camião",
  lotacao: "lotação",
};

function prettyAtom(atom: string): string {
  return atom
    .split("_")
    .map((word) => WORDS[word] ?? word)
    .join(" ");
}

/** "classe(meu_veiculo,pesado)" => "Classe de meu veículo: pesado". */
export function describeFact(fact: string): string {
  const match = /^(\w+)\((.+)\)$/.exec(fact.trim());
  if (!match) return fact;
  const [, predicate, rawArgs] = match;
  const [subject, ...rest] = rawArgs.split(",").map((part) => part.trim());
  const label = PREDICATES[predicate];
  if (!label || rest.length === 0) return fact;
  return `${label} de ${prettyAtom(subject)}: ${rest.map(prettyAtom).join(", ")}`;
}

const TRANSLATIONS: [RegExp, (...groups: string[]) => string][] = [
  [/^Fact (\d+) -> (.+) concluded by rule (\d+)$/, (n, f, r) => `Facto ${n} (${f}) foi concluído pela regra ${r}`],
  [/^Fact (\d+) -> (.+) was an initial fact$/, (n, f) => `Facto ${n} (${f}) é um facto inicial`],
  [/^Based on facts: \[(.*)\]$/, (ids) => `Com base nos factos: ${ids}`],
  [/^Conclusion not reached for fact ID (\d+)$/, (n) => `O motor não concluiu nenhum facto com o número ${n}`],
  [/^Investigating why not: (.+)$/, (f) => `A investigar porque não se concluiu: ${f}`],
  [/^Because by rule (\d+):$/, (r) => `Porque, pela regra ${r}:`],
  [/^Rule (\d+) could conclude (.+), but:$/, (r, f) => `A regra ${r} poderia concluir ${f}, mas:`],
  [/^Condition (.+) is false$/, (c) => `A condição ${c} é falsa`],
  [/^Premise failed: (.+)$/, (c) => `Premissa não satisfeita: ${c}`],
  [/^Premise (.+) is false$/, (c) => `A premissa ${c} é falsa`],
  [/^Because: The fact (.+) is not defined in the knowledge base$/, (f) => `Porque o facto ${f} não está definido na base de conhecimento`],
];

/** Traduz as explicações do motor, mantendo a indentação; linhas desconhecidas passam como estão. */
export function translateExplanation(line: string): string {
  const indent = /^\s*/.exec(line)?.[0] ?? "";
  const body = line.slice(indent.length);
  for (const [pattern, render] of TRANSLATIONS) {
    const match = pattern.exec(body);
    if (match) return indent + render(...match.slice(1));
  }
  return line;
}

export const FACT_FORMAT = /^\w+\(.+\)$/;
