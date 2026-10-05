package com.levis.devolucoes.dto.decisao;

import com.levis.devolucoes.dto.enums.Elegibilidade;

/** Regra disparada, pela ordem de disparo (rasto de auditoria). */
public record RegistoRegraResponse(
    int ordem,
    String codigoRegra,
    String nomeRegra,
    String modulo,
    String artigoId,
    Elegibilidade resultado,
    String mensagem,
    boolean aValidar) {}
