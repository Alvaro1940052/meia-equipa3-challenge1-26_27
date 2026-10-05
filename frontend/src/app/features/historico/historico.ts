import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { listarAvaliacoes } from '../../api/functions';
import { PaginaDtoAvaliacaoResumoResponse } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';
import { ELEGIBILIDADE, TIPO_TRANSACAO, rotulo } from '../../shared/rotulos';

/** Histórico de avaliações da loja (gestão), das mais recentes para as mais antigas. */
@Component({
  selector: 'lv-historico',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './historico.html',
})
export class HistoricoPagina {
  private readonly api = inject(Api);

  protected readonly tamanho = 20;
  protected readonly loja = signal('');
  protected readonly pagina = signal<PaginaDtoAvaliacaoResumoResponse | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly elegibilidade = (v?: string) => rotulo(ELEGIBILIDADE, v);
  protected readonly transacao = (v?: string) => rotulo(TIPO_TRANSACAO, v);

  constructor() {
    void this.carregar(0);
  }

  protected async carregar(numero: number): Promise<void> {
    this.erro.set(null);
    try {
      this.pagina.set(
        await this.api.invoke(listarAvaliacoes, {
          loja: this.loja().trim() || undefined,
          pagina: numero,
          tamanho: this.tamanho,
        }),
      );
    } catch (e) {
      this.erro.set(erroApresentavel(e));
    }
  }
}
