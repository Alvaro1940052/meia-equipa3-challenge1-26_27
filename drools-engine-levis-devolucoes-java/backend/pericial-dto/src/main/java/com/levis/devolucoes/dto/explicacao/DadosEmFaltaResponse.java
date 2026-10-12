package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** "O que falta?": os dados em falta para decidir. */
@Schema(description = "Dados em falta (perguntas ao colaborador), cada um com o seu Porquê")
public record DadosEmFaltaResponse(List<DadoEmFaltaDto> dados, boolean completo, String resumo) {}
