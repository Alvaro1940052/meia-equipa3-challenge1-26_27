import { HttpErrorResponse } from '@angular/common/http';

/** Erro da API para mostrar ao colaborador (ProblemDetail, com a lista de erros se houver). */
export interface ErroApresentavel {
  readonly titulo: string;
  readonly detalhe: string | null;
  readonly erros: readonly string[];
  readonly estado: number | null;
}

interface ProblemDetail {
  title?: string;
  detail?: string;
  erros?: string[];
}

export function erroApresentavel(erro: unknown): ErroApresentavel {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return {
        titulo: $localize`:@@erro.semLigacao:Sem ligação ao servidor`,
        detalhe: $localize`:@@erro.semLigacao.detalhe:Verifique a ligação e tente de novo.`,
        erros: [],
        estado: 0,
      };
    }
    if (erro.status === 403) {
      return {
        titulo: $localize`:@@erro.proibido:Sem permissão`,
        detalhe: $localize`:@@erro.proibido.detalhe:A sua função não dá acesso a esta informação.`,
        erros: [],
        estado: 403,
      };
    }
    const problema = (erro.error ?? {}) as ProblemDetail;
    return {
      titulo: problema.title ?? $localize`:@@erro.inesperado:Ocorreu um erro`,
      detalhe: problema.detail ?? null,
      erros: problema.erros ?? [],
      estado: erro.status,
    };
  }
  return {
    titulo: $localize`:@@erro.inesperado:Ocorreu um erro`,
    detalhe: erro instanceof Error ? erro.message : null,
    erros: [],
    estado: null,
  };
}
