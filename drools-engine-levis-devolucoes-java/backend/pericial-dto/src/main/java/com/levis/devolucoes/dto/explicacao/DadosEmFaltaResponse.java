package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * "O que falta?": os dados em falta para decidir. Quando uma paragem obrigatória já terminou a
 * inferência ({@code terminal}), não falta nenhum dado e {@code paragem} indica a regra que a
 * terminou (ADR 0004).
 */
@Schema(description = "Dados em falta (perguntas ao colaborador), cada um com o seu Porquê")
public record DadosEmFaltaResponse(
    List<DadoEmFaltaDto> dados,
    boolean completo,
    String resumo,
    @Schema(description = "Uma paragem obrigatória terminou a inferência: não é preciso mais nada")
        boolean terminal,
    @Schema(description = "Regra de paragem que terminou a inferência, ou nula") String paragem) {}
