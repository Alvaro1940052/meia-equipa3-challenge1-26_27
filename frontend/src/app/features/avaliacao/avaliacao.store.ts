import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Api } from '../../api/api';
import { avaliar, dadosEmFalta, porque } from '../../api/functions';
import { DadoEmFaltaDto, DadosEmFaltaResponse, ExplicacaoPorqueResponse } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';
import { definir, obter, semIndices } from '../../shared/caminhos';
import { Grupo, PASSOS, caminhoCompleto } from './formulario';
import { PedidoEmCurso, itemInicial, paraEnvio, pedidoInicial } from './pedido';

/** Atraso entre a última alteração e o pedido "O que falta?" à API. */
export const ATRASO_EM_FALTA_MS = 400;

/** "Porquê?" de uma pergunta: a explicação, o erro, ou a carregar. */
export type EstadoPorque = ExplicacaoPorqueResponse | ErroApresentavel | 'a-carregar';

/**
 * Estado do assistente de avaliação: o pedido em preenchimento, o passo atual, o "O que falta?"
 * (atualizado enquanto se preenche) e as explicações "Porquê?" pedidas.
 */
@Injectable()
export class AvaliacaoStore {
  private readonly api = inject(Api);
  private pedidoEmFalta = 0;

  readonly pedido = signal<PedidoEmCurso>(pedidoInicial());
  readonly passo = signal(0);
  readonly emFalta = signal<DadosEmFaltaResponse | null>(null);
  readonly erroEmFalta = signal<ErroApresentavel | null>(null);
  readonly porques = signal<Readonly<Record<string, EstadoPorque>>>({});
  readonly erro = signal<ErroApresentavel | null>(null);
  readonly aAvaliar = signal(false);

  /** Dados em falta por caminho (ex.: `artigos[0].revendivel`) */
  readonly emFaltaPorCaminho = computed(
    () => new Map((this.emFalta()?.dados ?? []).map((d) => [d.caminho ?? '', d] as const)),
  );

  /** Número de dados obrigatórios em falta em cada passo */
  readonly emFaltaPorPasso = computed(() => {
    const contagem = PASSOS.map(() => 0);
    for (const dado of this.emFalta()?.dados ?? []) {
      const indice = indicePasso(dado.caminho ?? '');
      if (indice >= 0 && dado.obrigatorio) {
        contagem[indice]++;
      }
    }
    return contagem;
  });

  readonly completo = computed(() => this.emFalta()?.completo ?? false);

  constructor() {
    effect((onCleanup) => {
      const pedido = this.pedido();
      const temporizador = setTimeout(
        () => untracked(() => void this.atualizarEmFalta(pedido)),
        ATRASO_EM_FALTA_MS,
      );
      onCleanup(() => clearTimeout(temporizador));
    });
  }

  definir(caminho: string, valor: unknown): void {
    this.pedido.update((p) => definir(p, caminho, valor));
    this.porques.set({});
  }

  adicionar(grupo: Grupo): void {
    const caminho = grupo.repeticao!.caminho;
    this.pedido.update((p) => {
      const lista = ((p as unknown as Record<string, unknown[]>)[caminho] ?? []) as unknown[];
      return definir(p, caminho, [...lista, itemInicial(grupo, lista.length + 1)]);
    });
  }

  remover(grupo: Grupo, indice: number): void {
    const caminho = grupo.repeticao!.caminho;
    this.pedido.update((p) => {
      const lista = ((p as unknown as Record<string, unknown[]>)[caminho] ?? []) as unknown[];
      return definir(
        p,
        caminho,
        lista.filter((_, i) => i !== indice),
      );
    });
  }

  irPara(passo: number): void {
    this.passo.set(Math.max(0, Math.min(PASSOS.length - 1, passo)));
  }

  /** Vai para o passo onde se preenche o dado em falta. */
  irParaDado(dado: DadoEmFaltaDto): void {
    const indice = indicePasso(dado.caminho ?? '');
    if (indice >= 0) {
      this.irPara(indice);
    }
  }

  /** "Porquê?": porque é que o sistema faz esta pergunta, para o pedido tal como está. */
  async explicarPorque(codigo: string): Promise<void> {
    this.porques.update((p) => ({ ...p, [codigo]: 'a-carregar' }));
    try {
      const resposta = await this.api.invoke(porque, {
        dado: codigo,
        body: paraEnvio(this.pedido()),
      });
      this.porques.update((p) => ({ ...p, [codigo]: resposta }));
    } catch (e) {
      this.porques.update((p) => ({ ...p, [codigo]: erroApresentavel(e) }));
    }
  }

  fecharPorque(codigo: string): void {
    this.porques.update((p) => {
      const { [codigo]: _, ...resto } = p;
      return resto;
    });
  }

  /** Avalia o pedido; devolve o identificador da avaliação gravada, ou null se a API recusar. */
  async avaliar(): Promise<string | null> {
    this.aAvaliar.set(true);
    this.erro.set(null);
    try {
      const decisao = await this.api.invoke(avaliar, { body: paraEnvio(this.pedido()) });
      return decisao.avaliacaoId ?? null;
    } catch (e) {
      this.erro.set(erroApresentavel(e));
      return null;
    } finally {
      this.aAvaliar.set(false);
    }
  }

  private async atualizarEmFalta(pedido: PedidoEmCurso): Promise<void> {
    const numero = ++this.pedidoEmFalta;
    try {
      const resposta = await this.api.invoke(dadosEmFalta, { body: paraEnvio(pedido) });
      if (numero === this.pedidoEmFalta) {
        this.emFalta.set(resposta);
        this.erroEmFalta.set(null);
      }
    } catch (e) {
      if (numero === this.pedidoEmFalta) {
        this.erroEmFalta.set(erroApresentavel(e));
      }
    }
  }
}

/**
 * Descrição de um dado em falta no idioma da interface: o rótulo do campo (com o artigo, nas
 * listas) ou o título do grupo; a descrição do backend só quando o dado não está no formulário.
 */
export function descricaoDado(dado: DadoEmFaltaDto, pedido: PedidoEmCurso): string {
  const caminho = dado.caminho ?? '';
  const alvo = semIndices(caminho);
  const indice = /\[(\d+)\]/.exec(caminho)?.[1];
  for (const grupo of PASSOS.flatMap((p) => p.grupos)) {
    const campo = grupo.campos.find((c) => semIndices(caminhoCompleto(grupo, c)) === alvo);
    const doGrupo = alvo === grupo.opcional || alvo === grupo.repeticao?.caminho;
    const parteDoItem =
      grupo.repeticao && indice !== undefined && alvo === `${grupo.repeticao.caminho}.produto`;
    if (campo || doGrupo || parteDoItem) {
      const rotulo = campo?.rotulo ?? grupo.titulo;
      if (grupo.repeticao && indice !== undefined) {
        const item = obter(pedido, `${grupo.repeticao.caminho}[${indice}].id`);
        return `${rotulo} · ${typeof item === 'string' ? item : `${grupo.repeticao.rotuloItem} ${Number(indice) + 1}`}`;
      }
      return rotulo;
    }
  }
  return dado.descricao ?? caminho;
}

/** Passo onde se preenche o dado com este caminho (o campo, ou o grupo que o contém). */
export function indicePasso(caminho: string): number {
  const alvo = semIndices(caminho);
  return PASSOS.findIndex((p) =>
    p.grupos.some(
      (g) =>
        alvo === g.opcional ||
        alvo === g.repeticao?.caminho ||
        g.campos.some((c) => {
          const campo = semIndices(caminhoCompleto(g, c));
          return campo === alvo || campo.startsWith(`${alvo}.`);
        }),
    ),
  );
}
