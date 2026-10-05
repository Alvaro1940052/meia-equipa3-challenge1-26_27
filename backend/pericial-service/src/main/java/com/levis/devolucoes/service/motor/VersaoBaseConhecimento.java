package com.levis.devolucoes.service.motor;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Properties;
import org.kie.api.builder.ReleaseId;
import org.kie.api.runtime.KieContainer;

/**
 * Versão da base de conhecimento (kjar) em uso, guardada em cada avaliação para auditoria e para
 * garantir que as explicações usam as mesmas regras que a decisão.
 */
public final class VersaoBaseConhecimento {

  private static final String POM =
      "/META-INF/maven/com.levis.devolucoes/pericial-rules/pom.properties";

  private final String valor;

  private VersaoBaseConhecimento(String valor) {
    this.valor = valor;
  }

  /**
   * Versão do contentor; se for o contentor do classpath sem releaseId, lê o pom.properties do
   * kjar.
   */
  public static VersaoBaseConhecimento de(KieContainer contentor) {
    ReleaseId id = contentor.getReleaseId();
    if (id != null && "com.levis.devolucoes".equals(id.getGroupId())) {
      return new VersaoBaseConhecimento(
          id.getGroupId() + ":" + id.getArtifactId() + ":" + id.getVersion());
    }
    try (InputStream entrada = VersaoBaseConhecimento.class.getResourceAsStream(POM)) {
      if (entrada == null) {
        return new VersaoBaseConhecimento("com.levis.devolucoes:pericial-rules:desconhecida");
      }
      Properties propriedades = new Properties();
      propriedades.load(entrada);
      return new VersaoBaseConhecimento(
          propriedades.getProperty("groupId")
              + ":"
              + propriedades.getProperty("artifactId")
              + ":"
              + propriedades.getProperty("version"));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public String valor() {
    return valor;
  }

  @Override
  public String toString() {
    return valor;
  }
}
