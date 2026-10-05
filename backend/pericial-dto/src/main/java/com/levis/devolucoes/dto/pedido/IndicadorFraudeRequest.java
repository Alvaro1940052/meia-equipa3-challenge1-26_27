package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.NivelRisco;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Indício de fraude registado pelo colaborador (EX-008). */
public record IndicadorFraudeRequest(@NotBlank String descricao, @NotNull NivelRisco nivelRisco) {}
