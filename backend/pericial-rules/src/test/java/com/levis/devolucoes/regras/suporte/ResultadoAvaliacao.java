package com.levis.devolucoes.regras.suporte;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import java.util.List;
import java.util.Map;

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

  public boolean disparou(String regra) {
    return disparos.contains(regra);
  }
}
