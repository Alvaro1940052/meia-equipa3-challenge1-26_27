package com.levis.devolucoes.service.mapeamento;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * JSON das respostas guardadas na auditoria (ex.: a decisão). Não é um bean, para não substituir o
 * ObjectMapper da aplicação web.
 */
public final class JsonServico {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
          .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  private JsonServico() {}

  public static String escrever(Object valor) {
    try {
      return JSON.writeValueAsString(valor);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Não foi possível converter para JSON", e);
    }
  }

  public static <T> T ler(String texto, Class<T> tipo) {
    try {
      return JSON.readValue(texto, tipo);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("JSON guardado inválido para " + tipo.getSimpleName(), e);
    }
  }
}
