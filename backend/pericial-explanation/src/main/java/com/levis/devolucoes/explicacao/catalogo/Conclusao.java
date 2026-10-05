package com.levis.devolucoes.explicacao.catalogo;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * Conclusão que uma regra pode produzir, declarada em {@code @conclusoes}: um campo de saída e,
 * opcionalmente, o valor (ex.: {@code OUT-001=PERMITIR}, {@code OUT-004=null}, {@code OUT-003}).
 *
 * @param campo campo de saída
 * @param valor nome do valor; nulo quando a regra pode produzir qualquer valor (ex.: OUT-003)
 */
public record Conclusao(CampoSaida campo, String valor) {

  /** Valor declarado para "sem valor" (ex.: TN-011 retira o meio de reembolso). */
  public static final String NULO = "null";

  public static Conclusao de(String texto) {
    String[] partes = texto.trim().split("=", 2);
    CampoSaida campo = CampoSaida.de(partes[0].trim());
    return new Conclusao(campo, partes.length == 2 ? partes[1].trim() : null);
  }

  public static List<Conclusao> lista(String texto) {
    if (texto == null || texto.isBlank()) {
      return List.of();
    }
    return Arrays.stream(texto.split(",")).map(Conclusao::de).toList();
  }

  /** A regra pode produzir qualquer valor deste campo. */
  public boolean qualquerValor() {
    return valor == null;
  }

  /** Indica se esta conclusão cobre o valor indicado do campo. */
  public boolean cobre(CampoSaida outroCampo, Object outroValor) {
    if (campo != outroCampo) {
      return false;
    }
    if (qualquerValor()) {
      return true;
    }
    String texto = outroValor == null ? NULO : outroValor.toString();
    return Objects.equals(valor, texto);
  }

  @Override
  public String toString() {
    return valor == null ? campo.codigo() : campo.codigo() + "=" + valor;
  }
}
