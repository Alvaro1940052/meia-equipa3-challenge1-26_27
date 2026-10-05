package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * "Porque não?" de uma regra.
 *
 * @param regraResponsavel regra que impediu (paragem ou precedência)
 * @param variante variante da regra mais próxima de disparar
 */
@Schema(description = "Razão de uma regra não ter disparado (Porque não?)")
public record ExplicacaoPorqueNaoResponse(
    String codigoRegra,
    String artigoId,
    CausaNaoDisparo causa,
    String regraResponsavel,
    String variante,
    List<CondicaoDto> condicoes,
    String resumo) {}
