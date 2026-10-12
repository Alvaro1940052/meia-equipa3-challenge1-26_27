package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.Mercado;
import com.levis.devolucoes.dto.enums.TipoLoja;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

/** Loja recetora (IN-001, IN-002). */
public record LojaRequest(
    @NotBlank String codigo,
    String nome,
    Mercado mercado,
    TipoLoja tipoLoja,
    boolean lojaBackPocket,
    boolean coberturaLojaUnica,
    Set<String> skusSortido) {}
