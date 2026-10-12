package com.levis.devolucoes.api.controller;

import com.levis.devolucoes.api.seguranca.ClaimsColaborador;
import com.levis.devolucoes.dto.comum.PaginaDto;
import com.levis.devolucoes.dto.decisao.AvaliacaoResumoResponse;
import com.levis.devolucoes.dto.decisao.DecisaoResponse;
import com.levis.devolucoes.dto.explicacao.DadosEmFaltaResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueResponse;
import com.levis.devolucoes.dto.pedido.PedidoAvaliacaoRequest;
import com.levis.devolucoes.service.avaliacao.AvaliacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Avaliação de pedidos de devolução, troca e ajuste de preço. */
@RestController
@RequestMapping("/api/v1/avaliacoes")
@Tag(name = "Avaliações")
public class AvaliacaoController {

  private final AvaliacaoService avaliacoes;

  public AvaliacaoController(AvaliacaoService avaliacoes) {
    this.avaliacoes = avaliacoes;
  }

  @PostMapping
  @Operation(
      operationId = "avaliar",
      summary = "Avalia um pedido e devolve a decisão",
      description =
          "O colaborador é o utilizador autenticado. Recusa o pedido (422) se faltarem dados"
              + " obrigatórios; ver /dados-em-falta.")
  @ApiResponse(responseCode = "201", description = "Avaliação gravada; Location aponta para ela")
  public ResponseEntity<DecisaoResponse> avaliar(
      @Valid @RequestBody PedidoAvaliacaoRequest pedido, @AuthenticationPrincipal Jwt token) {
    DecisaoResponse decisao = avaliacoes.avaliar(pedido, ClaimsColaborador.colaborador(token));
    return ResponseEntity.created(URI.create("/api/v1/avaliacoes/" + decisao.avaliacaoId()))
        .body(decisao);
  }

  @GetMapping("/{id}")
  @Operation(operationId = "consultarAvaliacao", summary = "Consulta uma avaliação")
  public DecisaoResponse consultar(@PathVariable UUID id) {
    return avaliacoes.consultar(id);
  }

  @GetMapping
  @Operation(
      operationId = "listarAvaliacoes",
      summary = "Histórico de avaliações, mais recentes primeiro (gestão da loja)")
  public PaginaDto<AvaliacaoResumoResponse> listar(
      @Parameter(description = "Código da loja; vazio para todas") @RequestParam(required = false)
          String loja,
      @RequestParam(defaultValue = "0") @Min(0) int pagina,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int tamanho) {
    return avaliacoes.listar(loja, pagina, tamanho);
  }

  @PostMapping("/dados-em-falta")
  @Operation(
      operationId = "dadosEmFalta",
      summary = "O que falta?",
      description =
          "Dados de entrada em falta (perguntas) para o pedido em preenchimento, cada um com o"
              + " seu \"Porquê?\". Aceita pedidos incompletos.")
  public DadosEmFaltaResponse dadosEmFalta(
      @RequestBody PedidoAvaliacaoRequest pedido,
      @AuthenticationPrincipal Jwt token,
      Locale locale) {
    return avaliacoes.dadosEmFalta(pedido, ClaimsColaborador.colaborador(token), locale);
  }

  @PostMapping("/porque")
  @Operation(
      operationId = "porque",
      summary = "Porquê?",
      description =
          "Porque é que o sistema faz a pergunta indicada (ex.: IN-010) para o pedido em"
              + " preenchimento. Aceita pedidos incompletos.")
  public ExplicacaoPorqueResponse porque(
      @Parameter(description = "Código do dado de entrada, ex.: IN-010") @RequestParam String dado,
      @RequestBody PedidoAvaliacaoRequest pedido,
      @AuthenticationPrincipal Jwt token,
      Locale locale) {
    return avaliacoes.porque(pedido, ClaimsColaborador.colaborador(token), dado, locale);
  }
}
