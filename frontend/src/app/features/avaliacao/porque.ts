import { Component, computed, input, output } from '@angular/core';
import { ExplicacaoPorqueResponse } from '../../api/models';
import { ErroApresentavel } from '../../core/erros';
import { semCodigo } from '../../shared/rotulos';
import { EstadoPorque } from './avaliacao.store';

/**
 * "Porquê?": porque é que o sistema faz uma pergunta. Mostra a pergunta, as regras que dependem do
 * dado e as que estão à espera dele para poderem decidir.
 */
@Component({
  selector: 'lv-porque',
  templateUrl: './porque.html',
  host: { class: 'explicacao porque', role: 'region' },
})
export class PorqueExplicacao {
  readonly codigo = input.required<string>();
  readonly estado = input.required<EstadoPorque>();
  readonly fechar = output<void>();

  protected readonly semCodigo = semCodigo;

  protected readonly explicacao = computed(() => {
    const e = this.estado();
    return e !== 'a-carregar' && 'dado' in e ? (e as ExplicacaoPorqueResponse) : null;
  });
  protected readonly erro = computed(() => {
    const e = this.estado();
    return e !== 'a-carregar' && 'titulo' in e ? (e as ErroApresentavel) : null;
  });
}
