package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * "Porquê?": porque é que o sistema faz uma pergunta.
 *
 * @param dado código do dado perguntado (ex.: IN-010)
 * @param regrasQueDependem regras cujas condições leem este dado
 * @param regrasEmEspera regras que, neste pedido, só esperam por esta resposta
 */
@Schema(description = "Razão de uma pergunta ao colaborador (Porquê?)")
public record ExplicacaoPorqueResponse(
    String dado,
    String pergunta,
    List<String> regrasQueDependem,
    List<RegraEmEsperaDto> regrasEmEspera,
    String resumo) {}
