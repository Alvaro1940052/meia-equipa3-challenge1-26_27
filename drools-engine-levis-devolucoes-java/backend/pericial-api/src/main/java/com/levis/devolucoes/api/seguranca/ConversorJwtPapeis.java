package com.levis.devolucoes.api.seguranca;

import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Converte o token num papel por função (ROLE_STYLIST, ROLE_LEAD_CASHIER, ...). Um token sem função
 * conhecida fica sem papéis e não acede à API.
 */
public class ConversorJwtPapeis implements Converter<Jwt, AbstractAuthenticationToken> {

  @Override
  public AbstractAuthenticationToken convert(Jwt token) {
    List<GrantedAuthority> papeis =
        ClaimsColaborador.funcao(token).stream()
            .<GrantedAuthority>map(f -> new SimpleGrantedAuthority("ROLE_" + f.name()))
            .toList();
    return new JwtAuthenticationToken(token, papeis, token.getSubject());
  }
}
