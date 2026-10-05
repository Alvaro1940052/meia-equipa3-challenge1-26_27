import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { detalheRegra } from '../../api/functions';
import { RegraDetalheDto } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';

/** Uma regra da base de conhecimento: as variantes, com as condições e as conclusões de cada uma. */
@Component({
  selector: 'lv-regra',
  imports: [RouterLink],
  templateUrl: './regra.html',
})
export class RegraPagina {
  private readonly api = inject(Api);

  /** ID da regra (parâmetro da rota) */
  readonly codigo = input.required<string>();

  protected readonly regra = signal<RegraDetalheDto | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);

  constructor() {
    effect(() => {
      const codigo = this.codigo();
      this.regra.set(null);
      this.erro.set(null);
      this.api
        .invoke(detalheRegra, { codigo })
        .then((r) => this.regra.set(r))
        .catch((e: unknown) => this.erro.set(erroApresentavel(e)));
    });
  }
}
