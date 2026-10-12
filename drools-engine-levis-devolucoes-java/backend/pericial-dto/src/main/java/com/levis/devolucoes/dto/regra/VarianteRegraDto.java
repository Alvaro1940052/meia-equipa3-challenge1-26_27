package com.levis.devolucoes.dto.regra;

import java.util.List;

/** Variante de uma regra DRL (mesmo ID, condições diferentes). */
public record VarianteRegraDto(
    String nome,
    String modulo,
    String descricao,
    List<String> condicoes,
    List<String> conclusoes,
    boolean aValidar) {}
