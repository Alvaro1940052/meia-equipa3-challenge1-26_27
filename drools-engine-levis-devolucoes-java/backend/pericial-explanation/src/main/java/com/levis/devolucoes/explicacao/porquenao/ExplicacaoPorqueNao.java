package com.levis.devolucoes.explicacao.porquenao;

import java.util.List;

/**
 * Explicação de uma regra não ter disparado.
 *
 * @param codigoRegra regra perguntada
 * @param artigoId artigo perguntado, ou nulo
 * @param causa causa classificada
 * @param regraResponsavel regra que impediu (paragem ou precedência), ou nula
 * @param variante variante da regra mais próxima de disparar (nome DRL), nas condições falhadas
 * @param condicoes condições avaliadas da variante mais próxima
 * @param resumo texto para o colaborador
 */
public record ExplicacaoPorqueNao(
    String codigoRegra,
    String artigoId,
    CausaNaoDisparo causa,
    String regraResponsavel,
    String variante,
    List<ResultadoCondicao> condicoes,
    String resumo) {

  public List<ResultadoCondicao> condicoesFalhadas() {
    return condicoes.stream().filter(ResultadoCondicao::falhou).toList();
  }
}
