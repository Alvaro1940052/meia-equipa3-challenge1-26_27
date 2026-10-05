package com.levis.devolucoes.api.seguranca;

import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.comum.TokenResponse;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.time.Clock;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Emite tokens assinados com a chave HMAC local, para desenvolvimento e testes. Em produção não
 * existe: os tokens vêm do fornecedor OIDC.
 */
public class EmissorTokens {

  static final String EMISSOR = "pericial-dev";

  private final JwtEncoder codificador;
  private final PropriedadesSeguranca propriedades;
  private final Clock relogio;

  public EmissorTokens(PropriedadesSeguranca propriedades, Clock relogio) {
    this.codificador =
        new NimbusJwtEncoder(new ImmutableSecret<>(ChaveHmac.de(propriedades.chaveHmac())));
    this.propriedades = propriedades;
    this.relogio = relogio;
  }

  public TokenResponse emitir(ColaboradorDto colaborador) {
    Instant agora = relogio.instant();
    Instant expira = agora.plus(propriedades.validadeToken());
    JwtClaimsSet.Builder claims =
        JwtClaimsSet.builder()
            .issuer(EMISSOR)
            .subject(colaborador.id())
            .issuedAt(agora)
            .expiresAt(expira)
            .claim(ClaimsColaborador.APROVADO_DM, colaborador.aprovadoPeloDM());
    if (colaborador.funcao() != null) {
      claims.claim(ClaimsColaborador.FUNCAO, colaborador.funcao().name());
    }
    if (colaborador.nome() != null) {
      claims.claim(ClaimsColaborador.NOME, colaborador.nome());
    }
    if (colaborador.idCredencialPOS() != null) {
      claims.claim(ClaimsColaborador.ID_CREDENCIAL_POS, colaborador.idCredencialPOS());
    }
    String token =
        codificador
            .encode(
                JwtEncoderParameters.from(
                    JwsHeader.with(MacAlgorithm.HS256).build(), claims.build()))
            .getTokenValue();
    return new TokenResponse(token, expira);
  }
}
