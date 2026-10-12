package com.levis.devolucoes.dto.comum;

import java.util.List;

/** Página de resultados. */
public record PaginaDto<T>(
    List<T> conteudo, int pagina, int tamanho, long totalElementos, int totalPaginas) {}
