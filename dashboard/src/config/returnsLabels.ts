import type { Elegibilidade } from "@/types/returns";

type Tone = "approved" | "rejected" | "info";

export const ELIGIBILITY: Record<Elegibilidade, { label: string; tone: Tone; hint: string }> = {
  PERMITIR: { label: "Permitido", tone: "approved", hint: "O pedido cumpre a política." },
  RECUSAR: { label: "Recusado", tone: "rejected", hint: "O pedido não cumpre a política." },
  REVER: { label: "Requer revisão", tone: "info", hint: "Precisa de aprovação antes de avançar." },
  ENCAMINHAR: { label: "Encaminhar", tone: "info", hint: "Deve seguir por outro canal." },
};

const LABELS: Record<string, string> = {
  // tipo de pedido / transação
  DEVOLUCAO: "Devolução",
  TROCA: "Troca",
  AJUSTE_PRECO: "Ajuste de preço",
  DEVOLUCAO_OFERTA: "Devolução de oferta",
  REEMBOLSO: "Reembolso",
  TROCA_MESMO_ARTIGO: "Troca pelo mesmo artigo",
  CREDITO_LOJA: "Crédito de loja",
  NENHUMA: "Nenhuma",
  // verificação
  VERIFICADA: "Compra verificada",
  AS_CEGAS: "Sem comprovativo (às cegas)",
  NAO_DETERMINADA: "Não determinada",
  // reembolso
  MEIO_ORIGINAL: "Meio de pagamento original",
  CARTAO_OFERTA: "Cartão-oferta",
  CARTAO_OFERTA_ELETRONICO: "Cartão-oferta eletrónico",
  MEIO_ALTERNATIVO: "Meio alternativo",
  APLICACAO_PAGAMENTO: "Aplicação de pagamento",
  // aprovação
  XSTORE_MANAGER: "Gestor de loja",
  RESPONSAVEL_SENIOR: "Responsável sénior",
  DISTRICT_AREA: "Gestão de área",
  // destino do artigo
  AREA_VENDAS: "Voltar à área de vendas",
  SALDOS: "Enviar para saldos",
  REETIQUETAR: "Reetiquetar",
  BAIXA_DANO: "Dar baixa (dano)",
  RISCO_BIOLOGICO: "Risco biológico",
  DEVOLUCAO_CLIENTE: "Devolver ao cliente",
  // base de valor
  VALOR_PAGO: "Valor pago",
  PRECO_ATUAL: "Preço atual",
  VALOR_PROMOCIONAL: "Valor promocional",
  VALOR_ESCALAO: "Valor por escalão",
  VALOR_POS: "Valor no ponto de venda",
  PVP_ORIGINAL: "Preço original",
  // processo
  POS: "Ponto de venda",
  BACKPOCKET: "Sistema de apoio (BackPocket)",
  AFTERPAY: "Afterpay",
  PAYPAL_VENMO: "PayPal / Venmo",
  VERIFONE_INTERAC: "Terminal Verifone / Interac",
  FRANQUIA_CANADA: "Franquia (Canadá)",
  DANO: "Processo de dano",
  // comprovativo e canal
  RECIBO_IMPRESSO: "Recibo impresso",
  RECIBO_DIGITAL: "Recibo digital",
  CONFIRMACAO_ENCOMENDA: "Confirmação de encomenda",
  RECIBO_OFERTA: "Recibo de oferta",
  CONSULTA_TRANSACAO: "Consulta da transação",
  FOTOGRAFIA_RECIBO: "Fotografia do recibo",
  CONSULTA_BACKPOCKET: "Consulta no sistema de apoio",
  MAINLINE: "Loja principal",
  OUTLET: "Outlet",
  SITE_PROPRIO: "Site da marca",
  SITE_PROPRIO_CA: "Site da marca (Canadá)",
  GROSSISTA: "Grossista",
  DESCONHECIDO: "Desconhecido",
  // artigo
  NAO_USADO: "Não usado",
  USADO: "Usado",
  LAVADO: "Lavado",
  COLOCADAS: "Colocadas",
  SOLTAS: "Soltas",
  AUSENTES: "Ausentes",
  // colaborador
  STYLIST: "Stylist",
  ELEVATED_STYLIST: "Stylist sénior",
  LEAD_CASHIER: "Responsável de caixa",
  KEY_HOLDER: "Responsável de turno",
  GESTAO_LOJA: "Gestão da loja",
  // pagamento
  CREDITO: "Cartão de crédito",
  DEBITO: "Cartão de débito",
  NUMERARIO: "Numerário",
};

/** Rótulo em português para um valor de enum; valores desconhecidos ficam legíveis. */
export function label(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const text = String(value);
  if (LABELS[text]) return LABELS[text];
  return /^[A-Z0-9_]+$/.test(text)
    ? text.charAt(0) + text.slice(1).toLowerCase().replace(/_/g, " ")
    : text;
}

export function money(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
    : String(value);
}

const CAUSES: Record<string, string> = {
  DISPAROU: "A regra disparou",
  MODULO_NAO_ALCANCADO: "O raciocínio não chegou a este passo",
  CANCELADA_POR_PRECEDENCIA: "Outra regra com prioridade impediu-a",
  CONDICOES_FALHADAS: "Alguma condição não se verificou",
};

export const cause = (value: unknown) => (typeof value === "string" ? (CAUSES[value] ?? label(value)) : "—");

/** Simulações "e se?" de um clique. Os caminhos seguem a estrutura do pedido. */
export const WHAT_IF_PRESETS: { label: string; changes: Record<string, unknown> }[] = [
  { label: "As etiquetas estivessem colocadas", changes: { "artigos[0].estado.etiquetas": "COLOCADAS" } },
  { label: "O portal online estivesse disponível", changes: { portalOnlineDisponivel: true } },
  { label: "O artigo estivesse usado", changes: { "artigos[0].estado.condicaoUso": "USADO" } },
];
