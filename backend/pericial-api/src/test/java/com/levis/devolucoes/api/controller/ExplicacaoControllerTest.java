package com.levis.devolucoes.api.controller;

import static com.levis.devolucoes.api.Exemplos.bearer;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.levis.devolucoes.api.Exemplos;
import com.levis.devolucoes.api.TesteController;
import com.levis.devolucoes.api.seguranca.EmissorTokens;
import com.levis.devolucoes.dto.enums.Funcao;
import com.levis.devolucoes.dto.explicacao.CausaNaoDisparo;
import com.levis.devolucoes.dto.explicacao.ExplicacaoComoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoResponse;
import com.levis.devolucoes.dto.simulacao.SimulacaoResponse;
import com.levis.devolucoes.service.excecao.VersaoBaseConhecimentoDiferenteException;
import com.levis.devolucoes.service.explicacao.ExplicacaoService;
import com.levis.devolucoes.service.simulacao.SimulacaoService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TesteController({ExplicacaoController.class, SimulacaoController.class})
class ExplicacaoControllerTest {

  private static final UUID ID = UUID.fromString("7b0c1f8e-2a54-4c39-9c51-6a0d3b2f1e10");
  private static final String BASE = "/api/v1/avaliacoes/{id}/explicacoes";

  @Autowired private MockMvc mvc;
  @Autowired private EmissorTokens emissor;
  @MockitoBean private ExplicacaoService explicacoes;
  @MockitoBean private SimulacaoService simulacoes;

  private MockHttpServletRequestBuilder pedir(String caminho) {
    return get(BASE + caminho, ID)
        .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST));
  }

  @Test
  void comoSemConclusaoDaOCaminhoCompleto() throws Exception {
    when(explicacoes.como(eq(ID), any()))
        .thenReturn(new ExplicacaoComoResponse(List.of(), List.of("M0", "M2"), null, "Caminho"));

    mvc.perform(pedir("/como"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.modulosPercorridos[1]").value("M2"));
  }

  @Test
  void comoDeUmaConclusaoDeUmArtigo() throws Exception {
    when(explicacoes.comoConclusao(eq(ID), eq("OUT-007"), eq("A-1"), any()))
        .thenReturn(
            new ExplicacaoConclusaoResponse(
                "OUT-007", "A-1", Map.of(), "BW-004", "m", List.of(), List.of(), "r"));

    mvc.perform(pedir("/como").param("conclusao", "OUT-007").param("artigo", "A-1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.regra").value("BW-004"));
  }

  @Test
  void porqueNaoDeUmaConclusao() throws Exception {
    when(explicacoes.porqueNaoConclusao(eq(ID), eq("OUT-001:PERMITIR"), eq(null), any()))
        .thenReturn(
            new ExplicacaoPorqueNaoConclusaoResponse(
                "OUT-001",
                "PERMITIR",
                null,
                "RECUSAR",
                false,
                List.of(),
                "HS-003",
                List.of(),
                "r"));

    mvc.perform(pedir("/porque-nao").param("conclusao", "OUT-001:PERMITIR"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.definidoPor").value("HS-003"));
  }

  @Test
  void porqueNaoDeUmaRegra() throws Exception {
    when(explicacoes.porqueNaoRegra(eq(ID), eq("HS-002"), eq(null), any()))
        .thenReturn(
            new ExplicacaoPorqueNaoResponse(
                "HS-002",
                null,
                CausaNaoDisparo.MODULO_NAO_ALCANCADO,
                "CH-008",
                null,
                List.of(),
                "r"));

    mvc.perform(pedir("/porque-nao").param("regra", "HS-002"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.causa").value("MODULO_NAO_ALCANCADO"));
  }

  @Test
  void porqueNaoExigeExatamenteUmParametro() throws Exception {
    mvc.perform(pedir("/porque-nao"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.type").value("/problemas/parametro-invalido"));
    mvc.perform(pedir("/porque-nao").param("regra", "PT-003").param("conclusao", "OUT-001:REVER"))
        .andExpect(status().isBadRequest());
    verifyNoInteractions(explicacoes);
  }

  @Test
  void outraVersaoDaBaseDeConhecimentoDa409() throws Exception {
    when(explicacoes.como(eq(ID), any()))
        .thenThrow(new VersaoBaseConhecimentoDiferenteException("g:a:1", "g:a:2"));

    mvc.perform(pedir("/como"))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.type").value("/problemas/versao-base-conhecimento"));
  }

  @Test
  void simulaUmCenarioAlternativo() throws Exception {
    when(simulacoes.simular(eq(ID), any(), any()))
        .thenReturn(
            new SimulacaoResponse(
                List.of(), List.of("CH-002"), List.of(), "r", Exemplos.decisao(ID)));

    mvc.perform(
            post("/api/v1/avaliacoes/{id}/simulacoes", ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"alteracoes\": {\"portalOnlineDisponivel\": true}}")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.regrasNovas[0]").value("CH-002"));
  }

  @Test
  void simulacaoSemAlteracoesDa400() throws Exception {
    mvc.perform(
            post("/api/v1/avaliacoes/{id}/simulacoes", ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"alteracoes\": {}}")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.erros[0]").exists());
    verifyNoInteractions(simulacoes);
  }
}
