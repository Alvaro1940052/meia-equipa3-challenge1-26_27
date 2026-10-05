package com.levis.devolucoes.api.config;

import com.levis.devolucoes.api.seguranca.ChaveHmac;
import com.levis.devolucoes.api.seguranca.ConversorJwtPapeis;
import com.levis.devolucoes.api.seguranca.EmissorTokens;
import com.levis.devolucoes.api.seguranca.PropriedadesSeguranca;
import com.levis.devolucoes.dto.enums.Funcao;
import java.time.Clock;
import java.util.Arrays;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Segurança da API: tokens JWT (OIDC em produção; assinados localmente com HMAC em desenvolvimento
 * e testes), um papel por {@link Funcao} e sessão sem estado.
 *
 * <p>Qualquer colaborador autenticado pode avaliar: a autorização para processar a devolução é
 * decidida pela regra HS-006, que encaminha e explica. Só a listagem do histórico fica reservada à
 * gestão (ADR 0008).
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(PropriedadesSeguranca.class)
public class SecurityConfig {

  /** Papéis com acesso ao histórico de avaliações da loja ("a validar"). */
  static final String[] PAPEIS_GESTAO = {
    Funcao.GESTAO_LOJA.name(), Funcao.XSTORE_MANAGER.name(), Funcao.KEY_HOLDER.name()
  };

  static final String[] TODOS_OS_PAPEIS =
      Arrays.stream(Funcao.values()).map(Funcao::name).toArray(String[]::new);

  @Bean
  public SecurityFilterChain filtrosSeguranca(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            pedidos ->
                pedidos
                    .requestMatchers("/actuator/health/**", "/actuator/info")
                    .permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                    .permitAll()
                    .requestMatchers("/api/v1/dev/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/avaliacoes")
                    .hasAnyRole(PAPEIS_GESTAO)
                    .requestMatchers("/api/v1/**")
                    .hasAnyRole(TODOS_OS_PAPEIS)
                    .anyRequest()
                    .denyAll())
        .oauth2ResourceServer(
            recurso ->
                recurso.jwt(jwt -> jwt.jwtAuthenticationConverter(new ConversorJwtPapeis())));
    return http.build();
  }

  /**
   * Desenvolvimento e testes: tokens HS256 com a chave local. Sem chave, vale a configuração OIDC
   * do Spring Boot (spring.security.oauth2.resourceserver.jwt.issuer-uri).
   */
  @Bean
  @ConditionalOnProperty("pericial.seguranca.chave-hmac")
  public JwtDecoder descodificadorHmac(PropriedadesSeguranca propriedades) {
    return NimbusJwtDecoder.withSecretKey(ChaveHmac.de(propriedades.chaveHmac()))
        .macAlgorithm(MacAlgorithm.HS256)
        .build();
  }

  @Bean
  @ConditionalOnProperty("pericial.seguranca.chave-hmac")
  public EmissorTokens emissorTokens(PropriedadesSeguranca propriedades, Clock relogio) {
    return new EmissorTokens(propriedades, relogio);
  }
}
