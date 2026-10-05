package com.levis.devolucoes.dto.decisao;

import com.levis.devolucoes.dto.enums.BaseValor;
import com.levis.devolucoes.dto.enums.DestinoProduto;
import com.levis.devolucoes.dto.enums.Elegibilidade;
import com.levis.devolucoes.dto.enums.NivelAprovacao;
import com.levis.devolucoes.dto.enums.TipoTransacao;
import java.math.BigDecimal;

/** Resultado de um artigo (ADR 0002), com o destino (OUT-007). */
public record ResultadoArtigoResponse(
    String artigoId,
    Elegibilidade elegibilidade,
    TipoTransacao tipoTransacao,
    BigDecimal valorDevolucao,
    BaseValor baseValor,
    DestinoProduto destino,
    int descontoSaldo,
    NivelAprovacao aprovacao,
    boolean terminal) {}
