/**
 * TypeScript interfaces for the Levi's Drools Expert Returns Engine.
 * Mirrors the Pydantic schemas from backend_orchestrator/app/schemas/levis.py.
 */

export type Elegibilidade = "PERMITIR" | "RECUSAR" | "REVER" | "ENCAMINHAR";

export type TipoVerificacao =
  | "VERIFICADA"
  | "AS_CEGAS"
  | "SEM_COMPROVATIVO"
  | "RECIBO_PRESENTE";

export type TipoTransacao =
  | "DEVOLUCAO"
  | "TROCA"
  | "AJUSTE_PRECO"
  | "GARANTIA"
  | "SEM_TRANSACAO"
  | "NENHUMA";

export type MeioReembolso =
  | "MEIO_ORIGINAL"
  | "VALE_COMPRAS"
  | "DINHEIRO"
  | "CARTAO"
  | "NAO_APLICAVEL";

export type NivelAprovacao =
  | "COLABORADOR"
  | "RESPONSAVEL_TURNO"
  | "RESPONSAVEL_SENIOR"
  | "STORE_MANAGER"
  | "DISTRICT_MANAGER"
  | "NENHUMA";

export type DestinoProduto =
  | "AREA_VENDAS"
  | "DANIFICADO"
  | "RISCO_BIOLOGICO"
  | "QUARANTENA"
  | "DEVOLUCAO_FABRICA"
  | "DESCONHECIDO";

export interface DocumentacaoResponse {
  assinaturaCliente?: string | null;
  assinaturaProcessador?: string | null;
  assinaturaTestemunha?: string | null;
  idStylistAtribuido?: string | null;
  reciboAgrafado?: boolean;
  notaRecibo?: string | null;
  retencaoAte?: string | null;
  registoExcecao?: string | null;
}

export interface RegistoRegraResponse {
  ordem: number;
  codigoRegra?: string | null;
  nomeRegra?: string | null;
  modulo?: string | null;
  artigoId?: string | null;
  resultado?: Elegibilidade | null;
  mensagem?: string | null;
  aValidar?: boolean;
}

export interface ResultadoArtigoResponse {
  artigoId: string;
  elegibilidade?: Elegibilidade | null;
  tipoTransacao?: TipoTransacao | null;
  valorDevolucao?: number | string | null;
  baseValor?: string | null;
  destino?: DestinoProduto | null;
  descontoSaldo?: number;
  aprovacao?: NivelAprovacao | null;
  terminal?: boolean;
}

export interface DecisaoResponse {
  avaliacaoId?: string | null;
  pedidoId?: string | null;
  avaliadaEm?: string | null;
  versaoBaseConhecimento?: string | null;
  elegibilidade?: Elegibilidade | null;
  tipoVerificacao?: TipoVerificacao | null;
  tipoTransacao?: TipoTransacao | null;
  valorDevolucao?: number | string | null;
  baseValor?: string | null;
  meioReembolso?: MeioReembolso | null;
  aprovacao?: NivelAprovacao | null;
  processo?: string | null;
  terminal?: boolean;
  excecaoRecusada?: boolean;
  documentacao?: DocumentacaoResponse | null;
  artigos: ResultadoArtigoResponse[];
  regras: RegistoRegraResponse[];
  regrasAValidar: string[];
}

export interface CondicaoDto {
  nome?: string | null;
  descricao?: string | null;
  cumprida?: boolean | null;
  valor?: string | null;
  artigoId?: string | null;
}

export interface PassoExplicacaoDto {
  ordem: number;
  modulo?: string | null;
  codigoRegra?: string | null;
  nomeRegra?: string | null;
  artigoId?: string | null;
  resultado?: Elegibilidade | null;
  mensagem?: string | null;
  aValidar?: boolean;
}

export interface ExplicacaoComoResponse {
  passos: PassoExplicacaoDto[];
  modulosPercorridos: string[];
  paragem?: string | null;
  resumo?: string | null;
}

export interface ExplicacaoPorqueNaoResponse {
  codigoRegra?: string | null;
  artigoId?: string | null;
  causa?: string | null;
  regraResponsavel?: string | null;
  variante?: string | null;
  condicoes: CondicaoDto[];
  resumo?: string | null;
}

export interface ExplicacaoPorqueNaoConclusaoResponse {
  conclusao?: string | null;
  valor?: string | null;
  artigoId?: string | null;
  valorObtido?: string | null;
  obtida?: boolean;
  propostaPor: string[];
  definidoPor?: string | null;
  regras: ExplicacaoPorqueNaoResponse[];
  resumo?: string | null;
}

export interface RegraEmEsperaDto {
  codigoRegra?: string | null;
  nomeRegra?: string | null;
  modulo?: string | null;
  artigoId?: string | null;
  conclusoes: string[];
  condicoesDoDado: CondicaoDto[];
}

export interface ExplicacaoPorqueResponse {
  dado?: string | null;
  codigo?: string | null;
  pergunta?: string | null;
  regrasQueDependem: string[];
  regrasEmEspera: RegraEmEsperaDto[];
  resumo?: string | null;
}

export interface DadoEmFaltaDto {
  codigo: string;
  caminho: string;
  descricao?: string | null;
  obrigatorio?: boolean;
  porque?: ExplicacaoPorqueResponse | null;
}

export interface DadosEmFaltaResponse {
  dados: DadoEmFaltaDto[];
  completo?: boolean;
  resumo?: string | null;
}

export interface DiferencaDto {
  alvo?: string | null;
  campo?: string | null;
  original?: string | null;
  simulado?: string | null;
}

export interface SimulacaoResponse {
  diferencas: DiferencaDto[];
  regrasNovas: string[];
  regrasRemovidas: string[];
  resumo?: string | null;
  decisaoSimulada?: DecisaoResponse | null;
}

export interface CenarioExemploResponse {
  id: number;
  titulo: string;
  estado?: string | null;
  aValidar: string[];
  pressupostos: string[];
  justificacao: string[];
  pedido: any;
  esperado?: Record<string, any> | null;
}

export interface RegraResumoDto {
  id: string;
  modulos: string[];
  descricao?: string | null;
  variantes: number;
  aValidar: boolean;
}
