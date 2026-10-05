package com.levis.devolucoes.dto.regra;

import java.util.List;

/** Regra da base de conhecimento com todas as variantes DRL. */
public record RegraDetalheDto(String id, List<VarianteRegraDto> variantes) {}
