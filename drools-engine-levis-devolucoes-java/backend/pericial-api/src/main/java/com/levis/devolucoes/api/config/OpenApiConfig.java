package com.levis.devolucoes.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Documento OpenAPI, de onde é gerado o cliente HTTP do frontend. */
@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {

  static final String ESQUEMA_SEGURANCA = "bearer-jwt";

  @Bean
  public OpenAPI documentoOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Sistema pericial de devoluções e trocas Levi's")
                .version("v1")
                .description(
                    "Decide devoluções, trocas e ajustes de preço e explica cada decisão (Como,"
                        + " Porquê, Porque não, E se, O que falta). O idioma das explicações segue"
                        + " o cabeçalho Accept-Language (pt-PT ou en)."))
        .components(
            new Components()
                .addSecuritySchemes(
                    ESQUEMA_SEGURANCA,
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
        .addServersItem(new Server().url("/").description("A própria origem da aplicação"))
        .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_SEGURANCA));
  }
}
