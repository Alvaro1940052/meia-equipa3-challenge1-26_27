package com.levis.devolucoes.api.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Entidades e repositórios do módulo de persistência. Fica fora da classe da aplicação para os
 * testes de controller (@WebMvcTest) não arrancarem o JPA.
 */
@Configuration(proxyBeanMethods = false)
@EntityScan("com.levis.devolucoes.persistencia.entidade")
@EnableJpaRepositories("com.levis.devolucoes.persistencia.repositorio")
public class PersistenciaConfig {}
