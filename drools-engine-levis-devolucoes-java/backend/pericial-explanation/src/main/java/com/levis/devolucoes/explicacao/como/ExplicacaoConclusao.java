package com.levis.devolucoes.explicacao.como;

import com.levis.devolucoes.explicacao.catalogo.CampoSaida;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import java.util.List;
import java.util.Map;

/**
 * "Como?" de uma conclusão: o caminho que levou ao valor de um campo de saída.
 *
 * @param campo campo de saída (conclusão)
 * @param artigoId artigo, ou nulo para o pedido
 * @param valores valor final de cada campo que guarda a conclusão
 * @param regra regra que fixou o valor final, ou nula
 * @param mensagem mensagem dessa regra
 * @param condicoes condições dessa regra sobre os dados de entrada, com os valores dos factos
 * @param caminho regras que alteraram a conclusão, por ordem ("regra: campo antes → depois")
 * @param resumo texto para o colaborador
 */
public record ExplicacaoConclusao(
    CampoSaida campo,
    String artigoId,
    Map<String, Object> valores,
    String regra,
    String mensagem,
    List<ResultadoCondicao> condicoes,
    List<String> caminho,
    String resumo) {}
