package com.levis.devolucoes.explicacao.catalogo;

import java.util.List;

/**
 * Metadados de uma regra DRL (uma variante de um ID da base de conhecimento).
 *
 * @param id ID da base de conhecimento ({@code @id})
 * @param nome nome completo da regra no DRL
 * @param modulo módulo ({@code @modulo}): TRANSVERSAL ou M0 a M9, ONLINE
 * @param descricao descrição ({@code @descricao}), com as marcas "a validar"
 * @param condicoes nomes das condições declaradas ({@code @condicoes})
 * @param semGuardaTerminal a regra corre mesmo depois de uma paragem obrigatória (ADR 0004)
 */
public record MetadadosRegra(
    String id,
    String nome,
    String modulo,
    String descricao,
    List<String> condicoes,
    boolean semGuardaTerminal) {

  /** Indica se a descrição tem uma marca de ambiguidade por validar (ADR 0003). */
  public boolean aValidar() {
    return descricao != null && descricao.contains("[a validar");
  }
}
