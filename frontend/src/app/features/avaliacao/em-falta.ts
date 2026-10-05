import { Component, computed, inject } from '@angular/core';
import { DadoEmFaltaDto } from '../../api/models';
import { AvaliacaoStore, descricaoDado } from './avaliacao.store';

/**
 * "O que falta?": os dados que o sistema ainda precisa para decidir, atualizados enquanto se
 * preenche. Cada um leva ao passo onde se responde e traz o seu "Porquê?".
 */
@Component({
  selector: 'lv-em-falta',
  templateUrl: './em-falta.html',
  host: { class: 'cartao em-falta-painel', 'aria-live': 'polite' },
})
export class EmFaltaPainel {
  protected readonly store = inject(AvaliacaoStore);

  protected readonly obrigatorios = computed(() =>
    (this.store.emFalta()?.dados ?? []).filter((d) => d.obrigatorio),
  );
  protected readonly opcionais = computed(() =>
    (this.store.emFalta()?.dados ?? []).filter((d) => !d.obrigatorio),
  );

  protected descricao(dado: DadoEmFaltaDto): string {
    return descricaoDado(dado, this.store.pedido());
  }

  protected chave(dado: DadoEmFaltaDto): string {
    return `${dado.codigo}|${dado.caminho}`;
  }
}
