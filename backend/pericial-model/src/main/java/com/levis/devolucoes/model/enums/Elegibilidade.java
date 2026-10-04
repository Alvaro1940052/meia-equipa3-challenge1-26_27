package com.levis.devolucoes.model.enums;

/**
 * Resultado de elegibilidade (OUT-001).
 *
 * <p>A ordem de severidade (ADR 0004) é PERMITIR &lt; REVER &lt; ENCAMINHAR &lt; RECUSAR: um
 * resultado já registado nunca é substituído por um menos severo.
 */
public enum Elegibilidade {
  PERMITIR(0),
  REVER(1),
  ENCAMINHAR(2),
  RECUSAR(3);

  private final int severidade;

  Elegibilidade(int severidade) {
    this.severidade = severidade;
  }

  public int getSeveridade() {
    return severidade;
  }

  /**
   * Indica se este resultado é mais severo do que o indicado; qualquer resultado é mais severo do
   * que nulo.
   */
  public boolean maisSeveroQue(Elegibilidade outro) {
    return outro == null || severidade > outro.severidade;
  }
}
