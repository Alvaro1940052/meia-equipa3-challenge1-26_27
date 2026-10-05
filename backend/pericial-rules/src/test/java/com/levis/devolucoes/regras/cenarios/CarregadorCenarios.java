package com.levis.devolucoes.regras.cenarios;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.IntStream;

/**
 * Carrega os 10 cenários de docs/06 ({@code /cenarios/cenario-NN.json}). Publicado no test-jar do
 * pericial-rules para os testes de explicações, serviço e API.
 */
public final class CarregadorCenarios {

  public static final int TOTAL = 10;

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  private CarregadorCenarios() {}

  /** Lê um cenário; cada chamada devolve factos novos (a avaliação altera o pedido). */
  public static Cenario ler(int numero) {
    String recurso = String.format("/cenarios/cenario-%02d.json", numero);
    try (InputStream entrada = CarregadorCenarios.class.getResourceAsStream(recurso)) {
      Objects.requireNonNull(entrada, recurso);
      return JSON.readValue(entrada, Cenario.class);
    } catch (IOException e) {
      throw new UncheckedIOException(recurso, e);
    }
  }

  public static List<Cenario> todos() {
    return IntStream.rangeClosed(1, TOTAL).mapToObj(CarregadorCenarios::ler).toList();
  }
}
