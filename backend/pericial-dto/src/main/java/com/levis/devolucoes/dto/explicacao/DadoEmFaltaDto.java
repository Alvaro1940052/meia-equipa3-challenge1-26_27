package com.levis.devolucoes.dto.explicacao;

/**
 * Dado em falta, isto é, uma pergunta ao colaborador, com o seu "Porquê?".
 *
 * @param codigo IN-001 a IN-010 ou a regra que o exige
 * @param caminho campo do pedido (ex.: artigos[0].revendivel)
 * @param obrigatorio necessário para decidir; caso contrário, só para resolver uma revisão
 */
public record DadoEmFaltaDto(
    String codigo,
    String caminho,
    String descricao,
    boolean obrigatorio,
    ExplicacaoPorqueResponse porque) {}
