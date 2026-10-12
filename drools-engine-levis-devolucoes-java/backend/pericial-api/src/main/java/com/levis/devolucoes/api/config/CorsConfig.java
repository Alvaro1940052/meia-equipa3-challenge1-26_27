package com.levis.devolucoes.api.config;

import com.levis.devolucoes.api.observabilidade.CorrelationIdFilter;
import com.levis.devolucoes.api.seguranca.PropriedadesSeguranca;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS restrito às origens configuradas (o frontend Angular). O Spring Security usa o bean pelo
 * nome corsConfigurationSource.
 */
@Configuration(proxyBeanMethods = false)
public class CorsConfig {

  @Bean
  public CorsConfigurationSource corsConfigurationSource(PropriedadesSeguranca propriedades) {
    CorsConfiguration cors = new CorsConfiguration();
    cors.setAllowedOrigins(propriedades.origensCors());
    cors.setAllowedMethods(List.of("GET", "POST"));
    cors.setAllowedHeaders(
        List.of(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.ACCEPT,
            HttpHeaders.ACCEPT_LANGUAGE,
            CorrelationIdFilter.CABECALHO));
    cors.setExposedHeaders(List.of(HttpHeaders.LOCATION, CorrelationIdFilter.CABECALHO));
    UrlBasedCorsConfigurationSource origem = new UrlBasedCorsConfigurationSource();
    origem.registerCorsConfiguration("/api/**", cors);
    return origem;
  }
}
