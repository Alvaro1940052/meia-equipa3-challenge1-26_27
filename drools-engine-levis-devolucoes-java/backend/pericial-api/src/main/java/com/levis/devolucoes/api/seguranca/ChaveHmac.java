package com.levis.devolucoes.api.seguranca;

import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

/** Chave HS256 dos tokens assinados localmente (desenvolvimento e testes). */
public final class ChaveHmac {

  private static final int BYTES_MINIMOS = 32;

  private ChaveHmac() {}

  public static SecretKey de(String chave) {
    byte[] bytes = chave.getBytes(StandardCharsets.UTF_8);
    if (bytes.length < BYTES_MINIMOS) {
      throw new IllegalStateException(
          "pericial.seguranca.chave-hmac tem de ter pelo menos " + BYTES_MINIMOS + " bytes");
    }
    return new SecretKeySpec(bytes, "HmacSHA256");
  }
}
