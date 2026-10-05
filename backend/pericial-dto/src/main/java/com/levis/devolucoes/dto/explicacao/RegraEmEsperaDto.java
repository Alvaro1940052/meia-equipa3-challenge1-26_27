package com.levis.devolucoes.dto.explicacao;

import java.util.List;

/**
 * Regra que só espera pela resposta à pergunta.
 *
 * @param conclusoes conclusões que produziria (ex.: OUT-001=PERMITIR)
 * @param condicoesDoDado condições que leem o dado perguntado
 */
public record RegraEmEsperaDto(
    String codigoRegra,
    String nomeRegra,
    String modulo,
    String artigoId,
    List<String> conclusoes,
    List<CondicaoDto> condicoesDoDado) {}
