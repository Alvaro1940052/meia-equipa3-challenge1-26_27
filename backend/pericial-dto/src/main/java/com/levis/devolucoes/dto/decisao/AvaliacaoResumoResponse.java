package com.levis.devolucoes.dto.decisao;

import com.levis.devolucoes.dto.enums.Elegibilidade;
import com.levis.devolucoes.dto.enums.TipoTransacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/** Linha do histórico de avaliações. */
public record AvaliacaoResumoResponse(
    UUID avaliacaoId,
    String pedidoId,
    LocalDateTime avaliadaEm,
    String lojaCodigo,
    Elegibilidade elegibilidade,
    TipoTransacao tipoTransacao,
    BigDecimal valorDevolucao) {}
