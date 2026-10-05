package com.levis.devolucoes.explicacao.esenao;

import com.levis.devolucoes.explicacao.motor.ExecutorSessao;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.rastreio.AlteracaoCampo;
import com.levis.devolucoes.explicacao.texto.GeradorTexto;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * "E se?": copia os factos, aplica as alterações pedidas, reavalia numa sessão nova e devolve as
 * diferenças no resultado. Os factos originais não são alterados.
 */
public class SimuladorCenario {

  private final ExecutorSessao executor;
  private final ClonadorFactos clonador;
  private final GeradorTexto texto;

  public SimuladorCenario(ExecutorSessao executor, ClonadorFactos clonador, GeradorTexto texto) {
    this.executor = executor;
    this.clonador = clonador;
    this.texto = texto;
  }

  /**
   * @param original avaliação original
   * @param pedidoOriginal pedido tal como foi submetido (antes da avaliação)
   * @param alteracoes caminho → novo valor
   */
  public ResultadoSimulacao simular(
      ResultadoExecucao original, PedidoDevolucao pedidoOriginal, Map<String, Object> alteracoes) {
    PedidoDevolucao alterado = clonador.alterar(pedidoOriginal, alteracoes);
    ResultadoExecucao simulado = executor.executar(alterado, original.fraudes());

    List<DiferencaSaida> diferencas =
        original.instantaneo().diferencas(simulado.instantaneo()).stream()
            .map(SimuladorCenario::diferenca)
            .toList();
    Set<String> antes = new LinkedHashSet<>(original.rastreio().idsDisparados());
    Set<String> depois = new LinkedHashSet<>(simulado.rastreio().idsDisparados());
    List<String> novas = depois.stream().filter(id -> !antes.contains(id)).toList();
    List<String> removidas = antes.stream().filter(id -> !depois.contains(id)).toList();
    String resumo =
        diferencas.isEmpty()
            ? texto.formatar("esenao.sem_diferencas")
            : texto.formatar("esenao.resumo", diferencas.size());
    return new ResultadoSimulacao(
        Collections.unmodifiableMap(new LinkedHashMap<>(alteracoes)),
        simulado,
        diferencas,
        novas,
        removidas,
        resumo);
  }

  private static DiferencaSaida diferenca(AlteracaoCampo alteracao) {
    return new DiferencaSaida(
        alteracao.alvo(), alteracao.campo(), alteracao.antes(), alteracao.depois());
  }
}
