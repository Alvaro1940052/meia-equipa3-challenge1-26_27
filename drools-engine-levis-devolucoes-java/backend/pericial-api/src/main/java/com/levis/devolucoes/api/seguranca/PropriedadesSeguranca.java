package com.levis.devolucoes.api.seguranca;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Configuração de segurança.
 *
 * @param chaveHmac chave dos tokens assinados localmente (só desenvolvimento e testes); vazia em
 *     produção, onde os tokens vêm do fornecedor OIDC
 * @param validadeToken validade dos tokens emitidos localmente
 * @param origensCors origens autorizadas a chamar a API a partir do browser
 */
@ConfigurationProperties("pericial.seguranca")
public record PropriedadesSeguranca(
    String chaveHmac,
    @DefaultValue("8h") Duration validadeToken,
    @DefaultValue List<String> origensCors) {}
