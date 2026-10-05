package com.levis.devolucoes.explicacao.esenao;

import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import java.util.List;
import java.util.Map;

/**
 * Resultado de "E se?".
 *
 * @param alteracoes alterações pedidas (caminho → valor)
 * @param simulado execução com as alterações
 * @param diferencas campos de saída que mudaram
 * @param regrasNovas regras que só disparam na simulação
 * @param regrasRemovidas regras que só disparam na avaliação original
 * @param resumo texto para o colaborador
 */
public record ResultadoSimulacao(
    Map<String, Object> alteracoes,
    ResultadoExecucao simulado,
    List<DiferencaSaida> diferencas,
    List<String> regrasNovas,
    List<String> regrasRemovidas,
    String resumo) {}
