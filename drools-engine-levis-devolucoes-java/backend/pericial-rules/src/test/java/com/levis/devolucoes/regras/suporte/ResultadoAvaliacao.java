package com.levis.devolucoes.regras.suporte;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.RegistoRegra;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * Resultado de uma avaliação em teste.
 *
 * @param decisao decisão do pedido
 * @param artigos decisões por artigo, indexadas pelo ID do artigo
 * @param disparos IDs das regras disparadas, pela ordem em que dispararam
 */
public record ResultadoAvaliacao(
    Decisao decisao, Map<String, DecisaoArtigo> artigos, List<String> disparos) {

  public DecisaoArtigo artigo(String id) {
    DecisaoArtigo artigo = artigos.get(id);
    if (artigo == null) {
      throw new IllegalArgumentException("Artigo sem decisão: " + id);
    }
    return artigo;
  }

  /** Regras disparadas, sem as regras de suporte dos campos de saída (OUT-001, OUT-003, ...). */
  public List<String> regrasDeNegocio() {
    return disparos.stream().filter(id -> !id.startsWith("OUT-")).toList();
  }

  public boolean disparou(String regra) {
    return disparos.contains(regra);
  }

  /** Primeiro registo da regra, na decisão do pedido ou de um artigo. */
  public RegistoRegra registo(String regra) {
    return Stream.concat(
            decisao.getRegistos().stream(),
            artigos.values().stream().flatMap(a -> a.getRegistos().stream()))
        .filter(r -> r.getCodigoRegra().equals(regra))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Regra sem registo: " + regra));
  }
}
