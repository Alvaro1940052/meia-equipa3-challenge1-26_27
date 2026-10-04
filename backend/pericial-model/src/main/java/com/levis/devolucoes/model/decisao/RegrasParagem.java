package com.levis.devolucoes.model.decisao;

import java.util.Set;

/**
 * Regras de paragem obrigatória (ADR 0004): quando dão RECUSAR ou ENCAMINHAR, terminam o fluxo.
 *
 * <p>HS-005 fica de fora: recusa a exceção pedida, não a devolução. CH-002 também: encaminha para a
 * BackPocket, mas a avaliação continua.
 */
public final class RegrasParagem {

  public static final Set<String> IDS =
      Set.of("HS-001", "HS-002", "HS-003", "HS-004", "HS-006", "CH-007", "CH-008");

  private RegrasParagem() {}

  public static boolean isParagem(String codigoRegra) {
    return IDS.contains(codigoRegra);
  }
}
