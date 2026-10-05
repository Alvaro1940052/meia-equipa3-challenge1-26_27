package com.levis.devolucoes.explicacao.como;

import com.levis.devolucoes.model.enums.Elegibilidade;

/**
 * Um passo do caminho percorrido: uma regra que disparou.
 *
 * @param ordem posição no caminho (começa em 1)
 * @param modulo módulo do fluxograma
 * @param codigoRegra ID da regra
 * @param nomeRegra nome da regra no DRL
 * @param artigoId artigo, ou nulo se for do pedido
 * @param resultado resultado registado, ou nulo se a regra só registou uma ação
 * @param mensagem mensagem para o colaborador
 * @param aValidar a regra tem uma ambiguidade por validar (ADR 0003)
 */
public record PassoExplicacao(
    int ordem,
    String modulo,
    String codigoRegra,
    String nomeRegra,
    String artigoId,
    Elegibilidade resultado,
    String mensagem,
    boolean aValidar) {}
