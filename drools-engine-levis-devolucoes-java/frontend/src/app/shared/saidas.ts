import {
  DESTINO_PRODUTO,
  ELEGIBILIDADE,
  MEIO_REEMBOLSO,
  NIVEL_APROVACAO,
  PROCESSO_OBRIGATORIO,
  Rotulos,
  TIPO_TRANSACAO,
} from './rotulos';

/** Conclusões do sistema pericial (OUT-001 a OUT-008), como o backend as identifica. */
export interface Saida {
  readonly codigo: string;
  readonly rotulo: string;
  /** Valores possíveis, para perguntar "Porque não?" (só nas conclusões com valores enumerados) */
  readonly valores?: Rotulos;
  /** Só existe por artigo (OUT-007) */
  readonly porArtigo: boolean;
}

export const SAIDAS: readonly Saida[] = [
  {
    codigo: 'OUT-001',
    rotulo: $localize`:@@saida.OUT-001:Elegibilidade`,
    valores: ELEGIBILIDADE,
    porArtigo: false,
  },
  {
    codigo: 'OUT-002',
    rotulo: $localize`:@@saida.OUT-002:Tipo de transação`,
    valores: TIPO_TRANSACAO,
    porArtigo: false,
  },
  { codigo: 'OUT-003', rotulo: $localize`:@@saida.OUT-003:Valor da devolução`, porArtigo: false },
  {
    codigo: 'OUT-004',
    rotulo: $localize`:@@saida.OUT-004:Meio de reembolso`,
    valores: MEIO_REEMBOLSO,
    porArtigo: false,
  },
  {
    codigo: 'OUT-005',
    rotulo: $localize`:@@saida.OUT-005:Aprovação`,
    valores: NIVEL_APROVACAO,
    porArtigo: false,
  },
  {
    codigo: 'OUT-006',
    rotulo: $localize`:@@saida.OUT-006:Processo obrigatório`,
    valores: PROCESSO_OBRIGATORIO,
    porArtigo: false,
  },
  {
    codigo: 'OUT-007',
    rotulo: $localize`:@@saida.OUT-007:Destino do produto`,
    valores: DESTINO_PRODUTO,
    porArtigo: true,
  },
  { codigo: 'OUT-008', rotulo: $localize`:@@saida.OUT-008:Documentação`, porArtigo: false },
];

export function saida(codigo: string): Saida {
  return SAIDAS.find((s) => s.codigo === codigo)!;
}
