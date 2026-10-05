package com.levis.devolucoes.explicacao.porquenao;

import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import java.util.Collection;
import java.util.List;

/**
 * Factos sobre os quais se avalia uma condição: o pedido, a decisão e, nas condições de artigo, o
 * artigo e a sua decisão.
 */
public record ContextoAvaliacao(
    PedidoDevolucao pedido,
    Decisao decisao,
    Collection<DecisaoArtigo> decisoesArtigos,
    List<IndicadorFraude> fraudes,
    ArtigoDevolvido artigo,
    DecisaoArtigo decisaoArtigo) {

  /** Contexto do pedido, sem artigo. */
  public static ContextoAvaliacao doPedido(ResultadoExecucao resultado) {
    return new ContextoAvaliacao(
        resultado.pedido(),
        resultado.decisao(),
        resultado.artigos().values(),
        resultado.fraudes(),
        null,
        null);
  }

  /** Contexto de um artigo do pedido. */
  public static ContextoAvaliacao doArtigo(ResultadoExecucao resultado, String artigoId) {
    ArtigoDevolvido artigo =
        resultado.pedido().getArtigos().stream()
            .filter(a -> artigoId.equals(a.getId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Artigo inexistente: " + artigoId));
    return new ContextoAvaliacao(
        resultado.pedido(),
        resultado.decisao(),
        resultado.artigos().values(),
        resultado.fraudes(),
        artigo,
        resultado.artigos().get(artigoId));
  }

  public boolean temArtigo() {
    return artigo != null;
  }
}
