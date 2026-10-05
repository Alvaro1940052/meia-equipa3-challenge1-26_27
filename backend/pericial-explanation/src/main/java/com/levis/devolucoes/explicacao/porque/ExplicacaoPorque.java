package com.levis.devolucoes.explicacao.porque;

import java.util.List;

/**
 * "Porquê?": porque é que o sistema faz uma pergunta ao colaborador.
 *
 * @param dado dado perguntado
 * @param pergunta texto da pergunta
 * @param regrasQueDependem IDs das regras cujas condições leem este dado (em geral)
 * @param regrasEmEspera regras que, neste pedido, só esperam por esta resposta
 * @param resumo texto para o colaborador
 */
public record ExplicacaoPorque(
    DadoEntrada dado,
    String pergunta,
    List<String> regrasQueDependem,
    List<RegraEmEspera> regrasEmEspera,
    String resumo) {}
