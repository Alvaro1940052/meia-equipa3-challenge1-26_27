package com.levis.devolucoes.explicacao.porque;

import com.levis.devolucoes.explicacao.catalogo.Conclusao;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import java.util.List;

/**
 * Regra que, neste pedido, só espera pela resposta à pergunta: as outras condições cumprem-se.
 *
 * @param codigoRegra ID da regra
 * @param nomeRegra variante (nome DRL)
 * @param modulo módulo
 * @param artigoId artigo, ou nulo
 * @param conclusoes conclusões que a regra produz se a resposta a satisfizer
 * @param condicoesDoDado condições que leem o dado perguntado, com o valor atual
 */
public record RegraEmEspera(
    String codigoRegra,
    String nomeRegra,
    String modulo,
    String artigoId,
    List<Conclusao> conclusoes,
    List<ResultadoCondicao> condicoesDoDado) {}
