package com.levis.devolucoes.explicacao.porquenao;

/** Causa para uma regra não ter disparado (docs/05, "Porque não"). */
public enum CausaNaoDisparo {
  /** A regra disparou: não há "porque não". */
  DISPAROU,
  /** O módulo nunca foi alcançado: uma paragem obrigatória anterior terminou o fluxo. */
  MODULO_NAO_ALCANCADO,
  /** A regra foi ativada mas cancelada por uma regra com precedência. */
  CANCELADA_POR_PRECEDENCIA,
  /** Uma ou mais condições declaradas não se verificam. */
  CONDICOES_FALHADAS
}
