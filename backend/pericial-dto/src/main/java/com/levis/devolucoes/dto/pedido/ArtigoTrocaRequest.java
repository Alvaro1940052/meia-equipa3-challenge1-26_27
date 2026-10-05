package com.levis.devolucoes.dto.pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/** Artigo que o cliente leva numa troca (EP-001, EP-002, TN-006). */
public record ArtigoTrocaRequest(
    @NotNull @Valid ProdutoRequest produto,
    boolean apenasMudaTamanho,
    @PositiveOrZero BigDecimal precoVenda) {}
