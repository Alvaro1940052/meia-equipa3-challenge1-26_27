import { Component, computed, inject, input } from '@angular/core';
import { obter } from '../../shared/caminhos';
import { AvaliacaoStore } from './avaliacao.store';
import { CampoFormulario } from './campo';
import { Grupo } from './formulario';
import { vazio } from './pedido';
import { PorqueExplicacao } from './porque';

/** Grupo de campos que responde a uma ou mais perguntas da base de conhecimento. */
@Component({
  selector: 'lv-grupo',
  imports: [CampoFormulario, PorqueExplicacao],
  templateUrl: './grupo.html',
})
export class GrupoFormulario {
  protected readonly store = inject(AvaliacaoStore);

  readonly grupo = input.required<Grupo>();

  protected readonly visivel = computed(() => {
    const condicao = this.grupo().visivelSe;
    return !condicao || !vazio(obter(this.store.pedido(), condicao));
  });

  protected readonly itens = computed(() => {
    const repeticao = this.grupo().repeticao;
    if (!repeticao) {
      return [];
    }
    const lista = obter(this.store.pedido(), repeticao.caminho);
    return Array.isArray(lista) ? lista.map((_, i) => i) : [];
  });

  protected readonly podeRemover = computed(
    () => this.itens().length > (this.grupo().repeticao?.minimo ?? 0),
  );
}
