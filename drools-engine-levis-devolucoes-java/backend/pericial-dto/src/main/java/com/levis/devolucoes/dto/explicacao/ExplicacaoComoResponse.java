package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** "Como?": o caminho completo que o sistema seguiu. */
@Schema(description = "Caminho completo que o sistema seguiu (Como?)")
public record ExplicacaoComoResponse(
    List<PassoExplicacaoDto> passos,
    List<String> modulosPercorridos,
    String paragem,
    String resumo) {}
