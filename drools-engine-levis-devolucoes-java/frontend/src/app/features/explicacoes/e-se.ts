import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { simular } from '../../api/functions';
import { SimulacaoResponse } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';
import { Campo, GRUPOS, caminhoCompleto } from '../avaliacao/formulario';
import { valorDoControlo } from '../avaliacao/pedido';
import { ELEGIBILIDADE, rotulo } from '../../shared/rotulos';

interface CampoSimulavel {
  readonly caminho: string;
  readonly rotulo: string;
  readonly campo: Campo;
}

interface Alteracao {
  readonly caminho: string;
  readonly rotulo: string;
  readonly texto: string;
  readonly valor: unknown;
}

/**
 * "E se?": reavalia a avaliação gravada com outros dados (ex.: e se o portal estivesse disponível?)
 * e mostra o que mudaria, sem alterar a avaliação.
 */
@Component({
  selector: 'lv-e-se',
  imports: [FormsModule],
  templateUrl: './e-se.html',
})
export class ESe {
  private readonly api = inject(Api);

  readonly avaliacaoId = input.required<string>();
  readonly artigos = input<readonly string[]>([]);

  /** Campos do pedido que se podem alterar (os dos artigos, para cada artigo da avaliação) */
  protected readonly campos = computed<CampoSimulavel[]>(() =>
    GRUPOS.filter((g) => !g.repeticao || g.repeticao.caminho === 'artigos').flatMap((g) =>
      g.repeticao
        ? this.artigos().flatMap((artigo, i) =>
            g.campos
              .filter((c) => c.caminho !== 'id')
              .map((c) => ({
                caminho: caminhoCompleto(g, c, i),
                rotulo: `${artigo} · ${c.rotulo}`,
                campo: c,
              })),
          )
        : g.campos.map((c) => ({ caminho: c.caminho, rotulo: c.rotulo, campo: c })),
    ),
  );

  protected readonly escolhido = signal('');
  protected readonly texto = signal('');
  protected readonly campoEscolhido = computed(() =>
    this.campos().find((c) => c.caminho === this.escolhido()),
  );
  protected readonly opcoes = computed(() => {
    const campo = this.campoEscolhido()?.campo;
    if (!campo) {
      return [];
    }
    if (campo.tipo === 'booleano' || campo.tipo === 'booleano-opcional') {
      return [
        ['true', $localize`:@@campo.sim:Sim`],
        ['false', $localize`:@@campo.nao:Não`],
      ];
    }
    return Object.entries(campo.opcoes ?? {});
  });

  protected readonly alteracoes = signal<Alteracao[]>([]);
  protected readonly resposta = signal<SimulacaoResponse | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly aCarregar = signal(false);
  protected readonly elegibilidade = (v?: string) => rotulo(ELEGIBILIDADE, v);

  protected acrescentar(): void {
    const escolhido = this.campoEscolhido();
    if (!escolhido) {
      return;
    }
    const valor = valorDoControlo(escolhido.campo, this.texto());
    const textoMostrado = this.opcoes().find((o) => o[0] === this.texto())?.[1] ?? this.texto();
    this.alteracoes.update((lista) => [
      ...lista.filter((a) => a.caminho !== escolhido.caminho),
      { caminho: escolhido.caminho, rotulo: escolhido.rotulo, texto: textoMostrado, valor },
    ]);
    this.texto.set('');
  }

  protected retirar(caminho: string): void {
    this.alteracoes.update((lista) => lista.filter((a) => a.caminho !== caminho));
  }

  protected async simular(): Promise<void> {
    this.aCarregar.set(true);
    this.erro.set(null);
    this.resposta.set(null);
    const alteracoes = Object.fromEntries(this.alteracoes().map((a) => [a.caminho, a.valor]));
    try {
      this.resposta.set(
        await this.api.invoke(simular, { id: this.avaliacaoId(), body: { alteracoes } }),
      );
    } catch (e) {
      this.erro.set(erroApresentavel(e));
    } finally {
      this.aCarregar.set(false);
    }
  }
}
