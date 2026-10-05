package com.levis.devolucoes.api.controller;

import com.levis.devolucoes.dto.regra.RegraDetalheDto;
import com.levis.devolucoes.dto.regra.RegraResumoDto;
import com.levis.devolucoes.service.regra.CatalogoRegrasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Catálogo da base de conhecimento. */
@RestController
@RequestMapping("/api/v1/regras")
@Tag(name = "Regras")
public class RegraController {

  private final CatalogoRegrasService catalogo;

  public RegraController(CatalogoRegrasService catalogo) {
    this.catalogo = catalogo;
  }

  @GetMapping
  @Operation(operationId = "listarRegras", summary = "Regras da base de conhecimento")
  public List<RegraResumoDto> listar() {
    return catalogo.listar();
  }

  @GetMapping("/{codigo}")
  @Operation(
      operationId = "detalheRegra",
      summary = "Detalhe de uma regra (condições, conclusões e variantes)")
  public RegraDetalheDto detalhe(@PathVariable String codigo) {
    return catalogo.detalhe(codigo);
  }
}
