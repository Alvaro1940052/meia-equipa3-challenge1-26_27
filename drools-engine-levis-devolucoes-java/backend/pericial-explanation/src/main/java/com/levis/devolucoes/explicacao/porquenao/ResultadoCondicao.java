package com.levis.devolucoes.explicacao.porquenao;

/**
 * Resultado da avaliação de uma condição.
 *
 * @param nome nome da condição
 * @param descricao descrição para o colaborador
 * @param cumprida verdadeiro, falso, ou nulo se não for avaliável (condição desconhecida ou de
 *     artigo sem artigo)
 * @param valor valores dos factos usados
 * @param artigoId artigo avaliado, ou nulo
 */
public record ResultadoCondicao(
    String nome, String descricao, Boolean cumprida, String valor, String artigoId) {

  public boolean falhou() {
    return Boolean.FALSE.equals(cumprida);
  }
}
