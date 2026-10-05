import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { porqueNao } from '../../api/functions';
import {
  ExplicacaoPorqueNaoConclusaoResponse,
  ExplicacaoPorqueNaoResponse,
} from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';
import { CAUSA_NAO_DISPARO, rotulo } from '../../shared/rotulos';
import { SAIDAS, saida } from '../../shared/saidas';

/**
 * "Porque não?": porque é que uma conclusão não foi obtida (ex.: porque não PERMITIR?), ou porque é
 * que uma regra não disparou.
 */
@Component({
  selector: 'lv-porque-nao',
  imports: [FormsModule],
  templateUrl: './porque-nao.html',
})
export class PorqueNao {
  private readonly api = inject(Api);

  readonly avaliacaoId = input.required<string>();
  readonly artigos = input<readonly string[]>([]);

  protected readonly saidas = SAIDAS.filter((s) => s.valores);
  protected readonly modo = signal<'conclusao' | 'regra'>('conclusao');
  protected readonly conclusao = signal('OUT-001');
  protected readonly valor = signal('PERMITIR');
  protected readonly artigo = signal('');
  protected readonly regra = signal('');
  protected readonly valores = computed(() =>
    Object.entries(saida(this.conclusao()).valores ?? {}),
  );
  protected readonly porArtigo = computed(() => saida(this.conclusao()).porArtigo);

  protected readonly respostaConclusao = signal<ExplicacaoPorqueNaoConclusaoResponse | null>(null);
  protected readonly respostaRegra = signal<ExplicacaoPorqueNaoResponse | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly aCarregar = signal(false);
  protected readonly causa = (c?: string) => rotulo(CAUSA_NAO_DISPARO, c);

  protected escolherConclusao(codigo: string): void {
    this.conclusao.set(codigo);
    this.valor.set(Object.keys(saida(codigo).valores ?? {})[0] ?? '');
    if (saida(codigo).porArtigo && !this.artigo()) {
      this.artigo.set(this.artigos()[0] ?? '');
    }
  }

  protected async perguntar(): Promise<void> {
    this.aCarregar.set(true);
    this.erro.set(null);
    this.respostaConclusao.set(null);
    this.respostaRegra.set(null);
    const artigo = this.artigo() || undefined;
    try {
      if (this.modo() === 'conclusao') {
        const r = await this.api.invoke(porqueNao, {
          id: this.avaliacaoId(),
          conclusao: `${this.conclusao()}:${this.valor()}`,
          artigo,
        });
        this.respostaConclusao.set(r as ExplicacaoPorqueNaoConclusaoResponse);
      } else {
        const r = await this.api.invoke(porqueNao, {
          id: this.avaliacaoId(),
          regra: this.regra().trim().toUpperCase(),
          artigo,
        });
        this.respostaRegra.set(r as ExplicacaoPorqueNaoResponse);
      }
    } catch (e) {
      this.erro.set(erroApresentavel(e));
    } finally {
      this.aCarregar.set(false);
    }
  }
}
