package com.levis.devolucoes.explicacao.motor;

import com.levis.devolucoes.explicacao.rastreio.InstantaneoDecisao;
import com.levis.devolucoes.explicacao.rastreio.RastreioExecucao;
import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import java.util.List;
import java.util.Map;

/**
 * Resultado de uma execução do motor: os factos de entrada, as decisões e o rastreio.
 *
 * @param pedido pedido avaliado (com o estado final, ex.: {@code suspenso})
 * @param fraudes indícios de fraude inseridos
 * @param decisao decisão do pedido
 * @param artigos decisões por artigo, pela ordem dos artigos do pedido
 * @param rastreio eventos da agenda
 */
public record ResultadoExecucao(
    PedidoDevolucao pedido,
    List<IndicadorFraude> fraudes,
    Decisao decisao,
    Map<String, DecisaoArtigo> artigos,
    RastreioExecucao rastreio) {

  public InstantaneoDecisao instantaneo() {
    return InstantaneoDecisao.capturar(decisao, artigos.values());
  }
}
