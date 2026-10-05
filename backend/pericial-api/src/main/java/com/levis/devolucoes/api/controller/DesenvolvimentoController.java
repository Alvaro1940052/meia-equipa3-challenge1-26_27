package com.levis.devolucoes.api.controller;

import com.levis.devolucoes.api.seguranca.EmissorTokens;
import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.comum.TokenResponse;
import com.levis.devolucoes.dto.enums.Funcao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Só no perfil dev: colaboradores de exemplo e tokens assinados com a chave local, para entrar no
 * frontend sem fornecedor OIDC. Não existe em produção.
 */
@RestController
@Profile("dev")
@RequestMapping("/api/v1/dev")
@Tag(name = "Desenvolvimento")
@SecurityRequirements
public class DesenvolvimentoController {

  static final List<ColaboradorDto> COLABORADORES =
      List.of(
          new ColaboradorDto("DEV-GL", "Gestão da Loja", Funcao.GESTAO_LOJA, false, "POS-GL"),
          new ColaboradorDto("DEV-KH", "Key Holder", Funcao.KEY_HOLDER, false, "POS-KH"),
          new ColaboradorDto("DEV-XM", "Xstore Manager", Funcao.XSTORE_MANAGER, false, "POS-XM"),
          new ColaboradorDto(
              "DEV-LC-DM", "Lead Cashier aprovado pelo DM", Funcao.LEAD_CASHIER, true, "POS-LC1"),
          new ColaboradorDto("DEV-LC", "Lead Cashier", Funcao.LEAD_CASHIER, false, "POS-LC2"),
          new ColaboradorDto(
              "DEV-ES-DM",
              "Elevated Stylist aprovado pelo DM",
              Funcao.ELEVATED_STYLIST,
              true,
              "POS-ES1"),
          new ColaboradorDto("DEV-ST", "Stylist", Funcao.STYLIST, false, "POS-ST"));

  private final EmissorTokens emissor;

  public DesenvolvimentoController(EmissorTokens emissor) {
    this.emissor = emissor;
  }

  @GetMapping("/colaboradores")
  @Operation(summary = "Colaboradores de exemplo (um por função)")
  public List<ColaboradorDto> colaboradores() {
    return COLABORADORES;
  }

  @PostMapping("/tokens")
  @Operation(summary = "Emite um token de acesso para o colaborador indicado")
  public TokenResponse token(@Valid @RequestBody ColaboradorDto colaborador) {
    return emissor.emitir(colaborador);
  }
}
