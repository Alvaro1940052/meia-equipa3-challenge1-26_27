package com.levis.devolucoes.service;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/** Aplicação mínima para os testes do serviço (o módulo é uma biblioteca). */
@SpringBootApplication(scanBasePackages = "com.levis.devolucoes.service")
@EntityScan("com.levis.devolucoes.persistencia.entidade")
@EnableJpaRepositories("com.levis.devolucoes.persistencia.repositorio")
public class AplicacaoServicoTeste {}
