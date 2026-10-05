package com.levis.devolucoes.dto.decisao;

import java.time.LocalDate;

/** Documentação da transação (OUT-008). */
public record DocumentacaoResponse(
    String assinaturaCliente,
    String assinaturaProcessador,
    String assinaturaTestemunha,
    String idStylistAtribuido,
    boolean reciboAgrafado,
    String notaRecibo,
    LocalDate retencaoAte,
    String registoExcecao) {}
