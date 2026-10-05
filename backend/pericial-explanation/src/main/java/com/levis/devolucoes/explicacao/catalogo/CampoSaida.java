package com.levis.devolucoes.explicacao.catalogo;

import java.util.List;
import java.util.Optional;

/** Campos de saída do sistema pericial (docs/01, OUT-001 a OUT-008) e os campos que os guardam. */
public enum CampoSaida {
  OUT_001("OUT-001", "Elegibilidade", false, List.of("elegibilidade")),
  OUT_002("OUT-002", "Tipo de transação", false, List.of("tipoTransacao")),
  OUT_003("OUT-003", "Valor da devolução", false, List.of("valorDevolucao", "baseValor")),
  OUT_004("OUT-004", "Meio de reembolso", false, List.of("meioReembolso")),
  OUT_005("OUT-005", "Aprovação", false, List.of("aprovacao")),
  OUT_006("OUT-006", "Processo obrigatório", false, List.of("processo")),
  OUT_007("OUT-007", "Destino do produto", true, List.of("destino", "descontoSaldo")),
  OUT_008("OUT-008", "Documentação", false, List.of("documentacao."));

  private final String codigo;
  private final String descricao;
  private final boolean doArtigo;
  private final List<String> campos;

  CampoSaida(String codigo, String descricao, boolean doArtigo, List<String> campos) {
    this.codigo = codigo;
    this.descricao = descricao;
    this.doArtigo = doArtigo;
    this.campos = campos;
  }

  public String codigo() {
    return codigo;
  }

  public String descricao() {
    return descricao;
  }

  /**
   * O campo só existe por artigo (OUT-007); os outros são do pedido e, alguns, também do artigo.
   */
  public boolean doArtigo() {
    return doArtigo;
  }

  /** Campos do instantâneo; um nome terminado em "." é um prefixo (ex.: documentacao.). */
  public List<String> campos() {
    return campos;
  }

  public boolean inclui(String campo) {
    return campos.stream().anyMatch(c -> c.endsWith(".") ? campo.startsWith(c) : campo.equals(c));
  }

  /** Campo de saída de um campo do instantâneo (ex.: destino → OUT-007); vazio se não for OUT. */
  public static Optional<CampoSaida> doCampo(String nomeCampo) {
    for (CampoSaida campo : values()) {
      if (campo.inclui(nomeCampo)) {
        return Optional.of(campo);
      }
    }
    return Optional.empty();
  }

  /** Aceita "OUT-001" ou "OUT_001". */
  public static CampoSaida de(String codigo) {
    for (CampoSaida campo : values()) {
      if (campo.codigo.equalsIgnoreCase(codigo) || campo.name().equalsIgnoreCase(codigo)) {
        return campo;
      }
    }
    throw new IllegalArgumentException("Campo de saída desconhecido: " + codigo);
  }
}
