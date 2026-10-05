package com.levis.devolucoes.dto.explicacao;

/**
 * Condição de uma regra avaliada.
 *
 * @param cumprida verdadeiro, falso, ou nulo se não for avaliável
 * @param valor valores dos factos usados
 */
public record CondicaoDto(
    String nome, String descricao, Boolean cumprida, String valor, String artigoId) {}
