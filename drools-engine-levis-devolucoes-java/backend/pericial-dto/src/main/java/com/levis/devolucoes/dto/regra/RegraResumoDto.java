package com.levis.devolucoes.dto.regra;

import java.util.List;

/** Regra da base de conhecimento, no catálogo. */
public record RegraResumoDto(
    String id, List<String> modulos, String descricao, int variantes, boolean aValidar) {}
