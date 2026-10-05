package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.CondicaoUso;
import com.levis.devolucoes.dto.enums.EstadoEtiquetas;

/**
 * Resultado da inspeção do artigo (IN-008). Etiqueta de preço, RFID e conjunto vazios contam como
 * corretos/completos.
 */
public record EstadoProdutoRequest(
    CondicaoUso condicaoUso,
    EstadoEtiquetas etiquetas,
    boolean personalizado,
    boolean alterado,
    boolean embainhado,
    boolean defeitoFabricoConfirmado,
    boolean sujoOuInseguro,
    boolean danificado,
    Boolean etiquetaPrecoCorreta,
    Boolean rfidCorreto,
    boolean embalagemIntacta,
    Boolean conjuntoCompleto) {}
