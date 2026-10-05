package com.levis.devolucoes.explicacao.porque;

import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import java.util.List;
import java.util.Map;

/**
 * "Porquê?": justificação do valor de um campo de saída.
 *
 * @param campo campo de saída perguntado
 * @param artigoId artigo (para OUT-007), ou nulo
 * @param valores valor final de cada campo que guarda o resultado
 * @param regra regra que definiu o valor final, ou nula
 * @param mensagem mensagem da regra
 * @param condicoes condições da regra sobre os dados de entrada, com os valores dos factos
 * @param historico regras que alteraram o campo, por ordem (incluindo a final)
 * @param resumo texto para o colaborador
 */
public record ExplicacaoPorque(
    CampoSaida campo,
    String artigoId,
    Map<String, Object> valores,
    String regra,
    String mensagem,
    List<ResultadoCondicao> condicoes,
    List<String> historico,
    String resumo) {}
