/**
 * Tipos canónicos TypeScript para o histórico unificado de inferências
 * e comparação multi-motor (Drools vs Prolog).
 */

export type MotorTipo = "DROOLS" | "PROLOG";
export type ElegibilidadeTipo = "PERMITIR" | "RECUSAR" | "TROCA" | "REVER" | "ENCAMINHAR";

export interface RegraItemDto {
  codigo: string;
  nome?: string | null;
  modulo?: string | null;
  mensagem?: string | null;
  resultado?: string | null;
}

/** Resultado mais recente de um motor para um caso (listagem agrupada por pedido). */
export interface MotorResultadoDto {
  motor: MotorTipo;
  elegibilidade: ElegibilidadeTipo;
  id: string;
}

export interface InferenciaItem {
  id: string;
  pedidoId: string;
  motor: MotorTipo;
  motorVersao?: string | null;
  produtoNome: string;
  produtoRef?: string | null;
  valorDevolucao: number;
  elegibilidade: ElegibilidadeTipo;
  tipoTransacao?: string | null;
  meioReembolso?: string | null;
  nivelAprovacao?: string | null;
  executadoEm: string;
  duracaoMs: number;
  regrasDisparadas: RegraItemDto[];
  temOutroMotor?: boolean;
  /** Resultado de cada motor para este caso (uma linha por caso na listagem). */
  motores?: MotorResultadoDto[];
  /** Com os dois motores: true se concordam, false se divergem; null com um só motor. */
  consenso?: boolean | null;
}

export interface InferenciaDetalheResponse extends InferenciaItem {
  inputPedidoJson: Record<string, unknown>;
  decisaoJson: Record<string, unknown>;
}

export interface ComparacaoMotoresResponse {
  pedidoId: string;
  consenso: boolean;
  resumoConsenso: string;
  razaoVelocidade?: string | null;
  instanciaDrools?: InferenciaItem | null;
  instanciaProlog?: InferenciaItem | null;
  divergencias: string[];
}

export interface PaginaResponse<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface AvaliarAmbosResponse {
  pedidoId: string;
  consenso: boolean;
  resumoConsenso: string;
  razaoVelocidade?: string | null;
  drools?: Record<string, unknown> | null;
  prolog?: Record<string, unknown> | null;
  droolsError?: string | null;
  comparacao?: ComparacaoMotoresResponse | null;
}

export interface SeedCenarioItem {
  cenarioId: number;
  pedidoId: string;
  titulo: string;
  droolsStatus: string;
  prologStatus: string;
  droolsElegibilidade?: string | null;
  prologElegibilidade?: string | null;
  erro?: string | null;
}

export interface SeedResponse {
  status: string;
  totalCenarios: number;
  cenariosProcessados: number;
  cenariosSaltados: number;
  executadosDrools: number;
  executadosProlog: number;
  erros: string[];
  detalhes: SeedCenarioItem[];
}
