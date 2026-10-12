package com.levis.devolucoes.dto.simulacao;

/** Campo de saída que muda na simulação ("pedido" ou o ID do artigo). */
public record DiferencaDto(String alvo, String campo, String original, String simulado) {}
