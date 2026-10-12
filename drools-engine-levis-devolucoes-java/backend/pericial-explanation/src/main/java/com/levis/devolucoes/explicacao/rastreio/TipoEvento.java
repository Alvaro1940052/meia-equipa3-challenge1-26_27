package com.levis.devolucoes.explicacao.rastreio;

/** Tipo de evento da agenda registado no rastreio. */
public enum TipoEvento {
  /** A regra foi ativada: as condições verificaram-se num dado momento. */
  CRIADA,
  /** A ativação disparou. */
  DISPARADA,
  /** A ativação foi cancelada antes de disparar (as condições deixaram de se verificar). */
  CANCELADA
}
