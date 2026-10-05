import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { DecisaoResponse } from '../../api/models';
import {
  BASE_VALOR,
  DESTINO_PRODUTO,
  ELEGIBILIDADE,
  MEIO_REEMBOLSO,
  NIVEL_APROVACAO,
  PROCESSO_OBRIGATORIO,
  TIPO_TRANSACAO,
  TIPO_VERIFICACAO,
  rotulo,
} from '../../shared/rotulos';
import { ComoConclusao } from '../explicacoes/como-conclusao';

/** Cartão de decisão: as conclusões OUT-001 a OUT-008, com "Como?" em cada uma. */
@Component({
  selector: 'lv-cartao-decisao',
  imports: [ComoConclusao, DecimalPipe, DatePipe],
  templateUrl: './cartao-decisao.html',
})
export class CartaoDecisao {
  readonly decisao = input.required<DecisaoResponse>();

  protected readonly r = {
    elegibilidade: (v?: string) => rotulo(ELEGIBILIDADE, v),
    verificacao: (v?: string) => rotulo(TIPO_VERIFICACAO, v),
    transacao: (v?: string) => rotulo(TIPO_TRANSACAO, v),
    base: (v?: string) => rotulo(BASE_VALOR, v),
    meio: (v?: string) => rotulo(MEIO_REEMBOLSO, v),
    aprovacao: (v?: string) => rotulo(NIVEL_APROVACAO, v),
    processo: (v?: string) => rotulo(PROCESSO_OBRIGATORIO, v),
    destino: (v?: string) => rotulo(DESTINO_PRODUTO, v),
  };

  /** "Como?" aberto: conclusão e artigo (vazio para as do pedido) */
  protected readonly comoAberto = signal<{ conclusao: string; artigo?: string } | null>(null);

  protected readonly classe = computed(() => (this.decisao().elegibilidade ?? '').toLowerCase());
  protected readonly temDocumentacao = computed(() => {
    const doc = this.decisao().documentacao;
    return (
      !!doc &&
      Object.values(doc).some((v) => v !== null && v !== undefined && v !== false && v !== '')
    );
  });

  protected alternarComo(conclusao: string, artigo?: string): void {
    const aberto = this.comoAberto();
    this.comoAberto.set(
      aberto?.conclusao === conclusao && aberto.artigo === artigo ? null : { conclusao, artigo },
    );
  }

  protected aberto(conclusao: string, artigo?: string): boolean {
    const aberto = this.comoAberto();
    return aberto?.conclusao === conclusao && aberto.artigo === artigo;
  }
}
