package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * "Porque não?" de uma conclusão (ex.: porque não OUT-001 = PERMITIR).
 *
 * @param propostaPor regras que chegaram a produzir o valor perguntado
 * @param definidoPor regra que fixou o valor final
 * @param regras explicação de cada regra capaz de produzir o valor
 */
@Schema(description = "Razão de uma conclusão não ter sido obtida (Porque não?)")
public record ExplicacaoPorqueNaoConclusaoResponse(
    String conclusao,
    String valor,
    String artigoId,
    String valorObtido,
    boolean obtida,
    List<String> propostaPor,
    String definidoPor,
    List<ExplicacaoPorqueNaoResponse> regras,
    String resumo) {}
