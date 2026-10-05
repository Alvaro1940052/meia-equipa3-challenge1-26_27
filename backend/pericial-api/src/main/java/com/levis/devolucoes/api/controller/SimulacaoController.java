package com.levis.devolucoes.api.controller;

import com.levis.devolucoes.dto.simulacao.SimulacaoRequest;
import com.levis.devolucoes.dto.simulacao.SimulacaoResponse;
import com.levis.devolucoes.service.simulacao.SimulacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Locale;
import java.util.UUID;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** "E se?": cenários alternativos sobre uma avaliação gravada, sem a alterar. */
@RestController
@RequestMapping("/api/v1/avaliacoes/{id}/simulacoes")
@Tag(name = "Simulações")
public class SimulacaoController {

  private final SimulacaoService simulacoes;

  public SimulacaoController(SimulacaoService simulacoes) {
    this.simulacoes = simulacoes;
  }

  @PostMapping
  @Operation(
      operationId = "simular",
      summary = "E se?",
      description = "Reavalia o pedido com as alterações indicadas e mostra as diferenças.")
  public SimulacaoResponse simular(
      @PathVariable UUID id, @Valid @RequestBody SimulacaoRequest pedido, Locale locale) {
    return simulacoes.simular(id, pedido, locale);
  }
}
