package com.levis.devolucoes.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Artigo devolvido (IN-007, IN-008, IN-010).
 *
 * @param quantidade unidades; vazio conta como 1
 * @param revendivel IN-010: verificável, reetiquetável e revendível; vazio até à inspeção
 * @param valorCalculadoPos valor calculado pelo POS (escalões, ajuste de preço)
 */
public record ArtigoRequest(
    @NotBlank String id,
    @NotNull @Valid ProdutoRequest produto,
    @Positive Integer quantidade,
    @PositiveOrZero BigDecimal precoPago,
    @Valid EstadoProdutoRequest estado,
    boolean entreCanais,
    Boolean revendivel,
    @PositiveOrZero BigDecimal valorCalculadoPos) {}
