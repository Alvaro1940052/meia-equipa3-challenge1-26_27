package com.levis.devolucoes.api;

import com.levis.devolucoes.api.config.CorsConfig;
import com.levis.devolucoes.api.config.SecurityConfig;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.time.Clock;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.AliasFor;
import org.springframework.test.context.ActiveProfiles;

/**
 * Teste de controller (MockMvc) com a segurança real: tokens HMAC do perfil de teste, papéis por
 * função, CORS e ProblemDetail. Os serviços são simulados com @MockitoBean.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@WebMvcTest
@ActiveProfiles("test")
@Import(TesteController.Configuracao.class)
public @interface TesteController {

  @AliasFor(annotation = WebMvcTest.class, attribute = "controllers")
  Class<?>[] value() default {};

  /** Segurança e CORS da aplicação (as classes @Configuration não entram no slice MVC). */
  @TestConfiguration(proxyBeanMethods = false)
  @Import({SecurityConfig.class, CorsConfig.class})
  class Configuracao {

    @Bean
    Clock relogio() {
      return Clock.systemUTC();
    }
  }
}
