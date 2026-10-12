package com.levis.devolucoes.explicacao.porquenao;

import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Condição declarada em {@code @condicoes}, avaliável em Java para explicar porque é que uma regra
 * disparou ou não disparou.
 *
 * @param nome nome usado em {@code @condicoes}
 * @param descricao descrição para o colaborador
 * @param doArtigo avalia-se sobre um artigo (caso contrário, sobre o pedido)
 * @param sobreEntrada depende só dos dados de entrada (e não do estado da decisão)
 * @param teste avaliação da condição
 * @param valor valores dos factos usados, para mostrar na explicação
 */
public record Predicado(
    String nome,
    String descricao,
    boolean doArtigo,
    boolean sobreEntrada,
    Predicate<ContextoAvaliacao> teste,
    Function<ContextoAvaliacao, String> valor) {

  /** Avalia a condição; nulo se for de artigo e o contexto não tiver artigo. */
  public Boolean avaliar(ContextoAvaliacao contexto) {
    if (doArtigo && !contexto.temArtigo()) {
      return null;
    }
    return teste.test(contexto);
  }

  public String valorEm(ContextoAvaliacao contexto) {
    if (doArtigo && !contexto.temArtigo()) {
      return null;
    }
    return valor == null ? null : valor.apply(contexto);
  }
}
