package com.levis.devolucoes.explicacao.como;

import java.util.List;

/**
 * "Como?": o caminho percorrido no fluxograma.
 *
 * @param passos regras disparadas, por ordem
 * @param modulosPercorridos módulos com pelo menos uma regra disparada, pela ordem de avaliação
 * @param paragem regra de paragem obrigatória que terminou o fluxo, ou nula
 * @param resumo texto para o colaborador
 */
public record ExplicacaoComo(
    List<PassoExplicacao> passos, List<String> modulosPercorridos, String paragem, String resumo) {}
