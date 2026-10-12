package com.levis.devolucoes.explicacao.emfalta;

/**
 * Dado de entrada em falta.
 *
 * @param codigo ID do dado na base de conhecimento (IN-001 a IN-010) ou da regra que o exige
 * @param caminho caminho do campo no pedido (ex.: {@code artigos[0].revendivel})
 * @param descricao o que falta, para o colaborador
 * @param obrigatorio necessário para decidir; caso contrário, só para resolver uma revisão (REVER)
 */
public record DadoEmFalta(String codigo, String caminho, String descricao, boolean obrigatorio) {}
