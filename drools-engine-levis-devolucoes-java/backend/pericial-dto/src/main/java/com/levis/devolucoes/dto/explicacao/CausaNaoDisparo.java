package com.levis.devolucoes.dto.explicacao;

/** Causa de uma regra não ter produzido a sua conclusão. */
public enum CausaNaoDisparo {
  DISPAROU,
  MODULO_NAO_ALCANCADO,
  CANCELADA_POR_PRECEDENCIA,
  CONDICOES_FALHADAS
}
