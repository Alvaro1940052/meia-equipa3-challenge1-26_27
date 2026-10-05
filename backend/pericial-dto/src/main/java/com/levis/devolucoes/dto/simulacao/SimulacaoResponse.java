package com.levis.devolucoes.dto.simulacao;

import com.levis.devolucoes.dto.decisao.DecisaoResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/** Resultado de "E se?": diferenças, regras novas e removidas, e a decisão simulada. */
@Schema(description = "Resultado de uma simulação (E se?)")
public record SimulacaoResponse(
    List<DiferencaDto> diferencas,
    List<String> regrasNovas,
    List<String> regrasRemovidas,
    String resumo,
    DecisaoResponse decisaoSimulada) {}
