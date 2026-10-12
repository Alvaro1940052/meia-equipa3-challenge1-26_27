import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Api } from '../../api/api';
import { como } from '../../api/functions';
import { ExplicacaoComoResponse } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';
import { ELEGIBILIDADE, rotulo, semCodigo } from '../../shared/rotulos';

/** "Como?": o caminho completo que o sistema seguiu, regra a regra, até à decisão. */
@Component({
  selector: 'lv-como-completo',
  templateUrl: './como-completo.html',
})
export class ComoCompleto implements OnInit {
  private readonly api = inject(Api);

  readonly avaliacaoId = input.required<string>();

  protected readonly explicacao = signal<ExplicacaoComoResponse | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly elegibilidade = (v?: string) => rotulo(ELEGIBILIDADE, v);
  protected readonly semCodigo = semCodigo;

  ngOnInit(): void {
    this.api
      .invoke(como, { id: this.avaliacaoId() })
      .then((r) => this.explicacao.set(r as ExplicacaoComoResponse))
      .catch((e: unknown) => this.erro.set(erroApresentavel(e)));
  }
}
