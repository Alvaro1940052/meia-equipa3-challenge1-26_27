package com.levis.devolucoes.api.observabilidade;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Identificador de correlação: usa o do cabeçalho X-Correlation-Id (se for válido) ou gera um novo,
 * põe-no nos logs (MDC "correlationId") e devolve-o na resposta.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

  public static final String CABECALHO = "X-Correlation-Id";
  public static final String CHAVE_MDC = "correlationId";

  private static final Pattern VALIDO = Pattern.compile("[A-Za-z0-9._-]{1,64}");

  @Override
  protected void doFilterInternal(
      HttpServletRequest pedido, HttpServletResponse resposta, FilterChain cadeia)
      throws ServletException, IOException {
    String recebido = pedido.getHeader(CABECALHO);
    String id =
        recebido != null && VALIDO.matcher(recebido).matches()
            ? recebido
            : UUID.randomUUID().toString();
    MDC.put(CHAVE_MDC, id);
    resposta.setHeader(CABECALHO, id);
    try {
      cadeia.doFilter(pedido, resposta);
    } finally {
      MDC.remove(CHAVE_MDC);
    }
  }
}
