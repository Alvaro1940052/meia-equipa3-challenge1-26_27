package com.levis.devolucoes.dto.explicacao;

import com.levis.devolucoes.dto.enums.Elegibilidade;

/** Um passo do caminho percorrido (uma regra disparada). */
public record PassoExplicacaoDto(
    int ordem,
    String modulo,
    String codigoRegra,
    String nomeRegra,
    String artigoId,
    Elegibilidade resultado,
    String mensagem,
    boolean aValidar) {}
