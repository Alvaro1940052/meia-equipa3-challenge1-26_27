import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { Api } from '../../api/api';
import { como } from '../../api/functions';
import { ExplicacaoConclusaoResponse } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';

/** "Como?" de uma conclusão: a regra que a definiu, as condições verificadas e o caminho até ela. */
@Component({
  selector: 'lv-como-conclusao',
  templateUrl: './como-conclusao.html',
  host: { class: 'explicacao como', role: 'region' },
})
export class ComoConclusao implements OnInit {
  private readonly api = inject(Api);

  readonly avaliacaoId = input.required<string>();
  readonly conclusao = input.required<string>();
  readonly artigo = input<string>();
  readonly fechar = output<void>();

  protected readonly explicacao = signal<ExplicacaoConclusaoResponse | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);

  ngOnInit(): void {
    this.api
      .invoke(como, { id: this.avaliacaoId(), conclusao: this.conclusao(), artigo: this.artigo() })
      .then((r) => this.explicacao.set(r as ExplicacaoConclusaoResponse))
      .catch((e: unknown) => this.erro.set(erroApresentavel(e)));
  }
}
