package com.levis.devolucoes.dto.pedido;

/**
 * Cliente e o seu comportamento (PT-006, EX-002, EX-003).
 *
 * @param forneceDados aceita dar dados pessoais; vazio conta como sim
 */
public record ClienteRequest(
    String id,
    Boolean forneceDados,
    boolean barreiraLinguistica,
    boolean contestaResultado,
    boolean agitado) {}
