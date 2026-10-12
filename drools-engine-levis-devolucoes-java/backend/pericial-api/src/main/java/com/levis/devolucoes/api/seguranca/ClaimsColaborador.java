package com.levis.devolucoes.api.seguranca;

import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.enums.Funcao;
import java.util.Optional;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Claims do token que identificam o colaborador. O colaborador da avaliação vem sempre do token,
 * nunca do corpo do pedido (ambiguidade A-24).
 */
public final class ClaimsColaborador {

  public static final String NOME = "name";
  public static final String FUNCAO = "funcao";
  public static final String APROVADO_DM = "aprovado_dm";
  public static final String ID_CREDENCIAL_POS = "id_credencial_pos";

  private ClaimsColaborador() {}

  /** Função indicada no token, se for uma das do enum {@link Funcao}. */
  public static Optional<Funcao> funcao(Jwt token) {
    String valor = token.getClaimAsString(FUNCAO);
    if (valor == null) {
      return Optional.empty();
    }
    try {
      return Optional.of(Funcao.valueOf(valor));
    } catch (IllegalArgumentException e) {
      return Optional.empty();
    }
  }

  public static ColaboradorDto colaborador(Jwt token) {
    return new ColaboradorDto(
        token.getSubject(),
        token.getClaimAsString(NOME),
        funcao(token).orElse(null),
        Boolean.TRUE.equals(token.getClaimAsBoolean(APROVADO_DM)),
        token.getClaimAsString(ID_CREDENCIAL_POS));
  }
}
