import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AvaliacaoStore } from './avaliacao.store';
import { EmFaltaPainel } from './em-falta';
import { PASSOS } from './formulario';
import { GrupoFormulario } from './grupo';

/**
 * Assistente de avaliação: o colaborador responde por passos às perguntas da base de conhecimento,
 * com "Porquê?" em cada pergunta e "O que falta?" sempre visível, e pede a decisão.
 */
@Component({
  selector: 'lv-avaliacao',
  imports: [GrupoFormulario, EmFaltaPainel],
  providers: [AvaliacaoStore],
  templateUrl: './avaliacao.html',
})
export class AvaliacaoPagina {
  protected readonly store = inject(AvaliacaoStore);
  private readonly router = inject(Router);

  protected readonly passos = PASSOS;
  protected readonly passoAtual = computed(() => PASSOS[this.store.passo()]);
  protected readonly ultimo = computed(() => this.store.passo() === PASSOS.length - 1);

  protected async avaliar(): Promise<void> {
    const id = await this.store.avaliar();
    if (id) {
      await this.router.navigate(['/avaliacoes', id]);
    }
  }
}
