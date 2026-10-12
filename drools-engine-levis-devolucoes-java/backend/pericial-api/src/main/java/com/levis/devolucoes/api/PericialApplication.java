package com.levis.devolucoes.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Aplicação Spring Boot do sistema pericial de devoluções e trocas. */
@SpringBootApplication(scanBasePackages = "com.levis.devolucoes")
public class PericialApplication {

  /** Instanciada só pelo Spring (classe de configuração). */
  protected PericialApplication() {}

  public static void main(String[] args) {
    SpringApplication.run(PericialApplication.class, args);
  }
}
