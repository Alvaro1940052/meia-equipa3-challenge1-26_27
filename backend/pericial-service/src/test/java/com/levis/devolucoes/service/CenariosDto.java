package com.levis.devolucoes.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.pedido.PedidoAvaliacaoRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

/**
 * Os cenários de docs/06 (JSON do test-jar do pericial-rules) como pedidos da API: o colaborador
 * passa a ser o utilizador autenticado e os indícios de fraude entram no pedido.
 */
public final class CenariosDto {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  private CenariosDto() {}

  /** Cenário em JSON (pedido, colaborador e esperado). */
  public record CenarioDto(
      int numero, PedidoAvaliacaoRequest pedido, ColaboradorDto colaborador, JsonNode esperado) {}

  public static CenarioDto ler(int numero) {
    String recurso = String.format("/cenarios/cenario-%02d.json", numero);
    try (InputStream entrada = CenariosDto.class.getResourceAsStream(recurso)) {
      JsonNode raiz = JSON.readTree(entrada);
      ObjectNode pedido = (ObjectNode) raiz.get("pedido").deepCopy();
      pedido.set("indicadoresFraude", raiz.get("indicadoresFraude"));
      ColaboradorDto colaborador =
          JSON.treeToValue(pedido.get("colaborador"), ColaboradorDto.class);
      pedido.remove("colaborador");
      return new CenarioDto(
          numero,
          JSON.treeToValue(pedido, PedidoAvaliacaoRequest.class),
          colaborador,
          raiz.get("esperado"));
    } catch (IOException e) {
      throw new UncheckedIOException(recurso, e);
    }
  }
}
