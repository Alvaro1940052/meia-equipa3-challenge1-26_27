package com.levis.devolucoes.dto.explicacao;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

/**
 * "Como?" de uma conclusão: a regra que a fixou, as condições cumpridas e o caminho até ela.
 *
 * @param conclusao campo de saída (ex.: OUT-001)
 * @param valores valor final de cada campo que guarda a conclusão
 * @param caminho regras que alteraram a conclusão, por ordem
 */
@Schema(description = "Caminho até uma conclusão (Como?)")
public record ExplicacaoConclusaoResponse(
    String conclusao,
    String artigoId,
    Map<String, String> valores,
    String regra,
    String mensagem,
    List<CondicaoDto> condicoes,
    List<String> caminho,
    String resumo) {}
