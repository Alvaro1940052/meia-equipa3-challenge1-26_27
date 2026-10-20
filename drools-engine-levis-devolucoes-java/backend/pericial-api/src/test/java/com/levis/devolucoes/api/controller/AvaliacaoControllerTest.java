package com.levis.devolucoes.api.controller;

import static com.levis.devolucoes.api.Exemplos.PEDIDO_MINIMO;
import static com.levis.devolucoes.api.Exemplos.bearer;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.levis.devolucoes.api.Exemplos;
import com.levis.devolucoes.api.TesteController;
import com.levis.devolucoes.api.seguranca.EmissorTokens;
import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.comum.PaginaDto;
import com.levis.devolucoes.dto.enums.Funcao;
import com.levis.devolucoes.dto.explicacao.DadosEmFaltaResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueResponse;
import com.levis.devolucoes.dto.pedido.PedidoAvaliacaoRequest;
import com.levis.devolucoes.service.avaliacao.AvaliacaoService;
import com.levis.devolucoes.service.excecao.PedidoInvalidoException;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TesteController(AvaliacaoController.class)
class AvaliacaoControllerTest {

  private static final UUID ID = UUID.fromString("7b0c1f8e-2a54-4c39-9c51-6a0d3b2f1e10");

  @Autowired private MockMvc mvc;
  @Autowired private EmissorTokens emissor;
  @MockitoBean private AvaliacaoService avaliacoes;

  private MockHttpServletRequestBuilder avaliar(String corpo) {
    return post("/api/v1/avaliacoes").contentType(MediaType.APPLICATION_JSON).content(corpo);
  }

  @Test
  void semTokenRespondeNaoAutenticado() throws Exception {
    mvc.perform(avaliar(PEDIDO_MINIMO)).andExpect(status().isUnauthorized());
    verify(avaliacoes, never()).avaliar(any(), any());
  }

  @Test
  void tokenComAssinaturaInvalidaERecusado() throws Exception {
    String token = bearer(emissor, Funcao.KEY_HOLDER);
    String adulterado = token.substring(0, token.length() - 4) + "AAAA";

    mvc.perform(avaliar(PEDIDO_MINIMO).header(HttpHeaders.AUTHORIZATION, adulterado))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void avaliaComOColaboradorDoTokenEDevolveALocalizacao() throws Exception {
    when(avaliacoes.avaliar(any(), any())).thenReturn(Exemplos.decisao(ID));
    ColaboradorDto lead = new ColaboradorDto("C-77", "Ana", Funcao.LEAD_CASHIER, true, "POS-77");

    mvc.perform(avaliar(PEDIDO_MINIMO).header(HttpHeaders.AUTHORIZATION, bearer(emissor, lead)))
        .andExpect(status().isCreated())
        .andExpect(header().string(HttpHeaders.LOCATION, "/api/v1/avaliacoes/" + ID))
        .andExpect(jsonPath("$.avaliacaoId").value(ID.toString()))
        .andExpect(jsonPath("$.elegibilidade").value("PERMITIR"));

    ArgumentCaptor<ColaboradorDto> colaborador = ArgumentCaptor.forClass(ColaboradorDto.class);
    verify(avaliacoes).avaliar(any(PedidoAvaliacaoRequest.class), colaborador.capture());
    assertThat(colaborador.getValue()).isEqualTo(lead);
  }

  /** HS-006 é decidida pelas regras (ENCAMINHAR com explicação), não pela API (ADR 0008). */
  @ParameterizedTest
  @EnumSource(Funcao.class)
  void qualquerFuncaoPodeSubmeterUmaAvaliacao(Funcao funcao) throws Exception {
    when(avaliacoes.avaliar(any(), any())).thenReturn(Exemplos.decisao(ID));

    mvc.perform(avaliar(PEDIDO_MINIMO).header(HttpHeaders.AUTHORIZATION, bearer(emissor, funcao)))
        .andExpect(status().isCreated());
  }

  @Test
  void tokenSemFuncaoConhecidaNaoAcedeAApi() throws Exception {
    ColaboradorDto semFuncao = new ColaboradorDto("C-1", "Sem função", null, false, null);

    mvc.perform(
            avaliar(PEDIDO_MINIMO).header(HttpHeaders.AUTHORIZATION, bearer(emissor, semFuncao)))
        .andExpect(status().isForbidden());
  }

  @Test
  void oColaboradorNaoPodeVirNoCorpoDoPedido() throws Exception {
    String comColaborador =
        """
        {"artigos": [{"id": "A-1", "produto": {"sku": "501"}}],
         "colaborador": {"id": "X", "funcao": "GESTAO_LOJA"}}
        """;

    mvc.perform(
            avaliar(comColaborador)
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isBadRequest());
    verify(avaliacoes, never()).avaliar(any(), any());
  }

  @Test
  void pedidoMalFormadoDaProblemDetailComOsCampos() throws Exception {
    String semArtigos = "{\"id\": \"P-1\", \"artigos\": []}";

    mvc.perform(
            avaliar(semArtigos)
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.KEY_HOLDER)))
        .andExpect(status().isBadRequest())
        .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/problem+json"))
        .andExpect(jsonPath("$.type").value("/problemas/validacao"))
        .andExpect(jsonPath("$.erros", hasItem(matchesPattern("artigos: .*"))));
  }

  @Test
  void dadosObrigatoriosEmFaltaDao422ComALista() throws Exception {
    when(avaliacoes.avaliar(any(), any()))
        .thenThrow(
            new PedidoInvalidoException(
                "Faltam dados obrigatórios para decidir.", List.of("IN-006 dataPedido: data")));

    mvc.perform(
            avaliar(PEDIDO_MINIMO)
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.KEY_HOLDER)))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(jsonPath("$.type").value("/problemas/pedido-invalido"))
        .andExpect(jsonPath("$.detail").value("Faltam dados obrigatórios para decidir."))
        .andExpect(jsonPath("$.erros[0]").value("IN-006 dataPedido: data"));
  }

  @Test
  void consultaUmaAvaliacao() throws Exception {
    when(avaliacoes.consultar(ID)).thenReturn(Exemplos.decisao(ID));

    mvc.perform(
            get("/api/v1/avaliacoes/{id}", ID)
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pedidoId").value("P-1"))
        .andExpect(jsonPath("$.avaliadaEm").value("2026-03-31T10:00:00"));
  }

  @Test
  void avaliacaoInexistenteDa404() throws Exception {
    when(avaliacoes.consultar(ID)).thenThrow(new RecursoNaoEncontradoException("Não existe"));

    mvc.perform(
            get("/api/v1/avaliacoes/{id}", ID)
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("/problemas/nao-encontrado"));
  }

  @Test
  void identificadorMalFormadoDa400() throws Exception {
    mvc.perform(
            get("/api/v1/avaliacoes/nao-e-um-uuid")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void historicoReservadoAGestao() throws Exception {
    when(avaliacoes.listar("US-ML-100", 1, 10)).thenReturn(new PaginaDto<>(List.of(), 1, 10, 0, 0));

    mvc.perform(
            get("/api/v1/avaliacoes")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isForbidden());
    mvc.perform(
            get("/api/v1/avaliacoes")
                .param("loja", "US-ML-100")
                .param("pagina", "1")
                .param("tamanho", "10")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.GESTAO_LOJA)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.pagina").value(1));
  }

  @Test
  void tamanhoDePaginaLimitado() throws Exception {
    mvc.perform(
            get("/api/v1/avaliacoes")
                .param("tamanho", "500")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.KEY_HOLDER)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void dadosEmFaltaAceitaPedidoIncompletoENoIdiomaPedido() throws Exception {
    when(avaliacoes.dadosEmFalta(any(), any(), any()))
        .thenReturn(new DadosEmFaltaResponse(List.of(), false, "Missing", false, null));

    mvc.perform(
            post("/api/v1/avaliacoes/dados-em-falta")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .header(HttpHeaders.ACCEPT_LANGUAGE, "en")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.resumo").value("Missing"));

    verify(avaliacoes).dadosEmFalta(any(), any(), eq(Locale.ENGLISH));
  }

  @Test
  void porqueSemIdiomaUsaPortugues() throws Exception {
    when(avaliacoes.porque(any(), any(), eq("IN-010"), any()))
        .thenReturn(new ExplicacaoPorqueResponse("IN-010", "?", List.of(), List.of(), "Porque"));

    mvc.perform(
            post("/api/v1/avaliacoes/porque")
                .param("dado", "IN-010")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.dado").value("IN-010"));

    verify(avaliacoes).porque(any(), any(), eq("IN-010"), eq(Locale.forLanguageTag("pt-PT")));
  }

  @Test
  void devolveOIdentificadorDeCorrelacao() throws Exception {
    when(avaliacoes.consultar(ID)).thenReturn(Exemplos.decisao(ID));

    mvc.perform(
            get("/api/v1/avaliacoes/{id}", ID)
                .header("X-Correlation-Id", "pedido-123")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(header().string("X-Correlation-Id", "pedido-123"));
    mvc.perform(
            get("/api/v1/avaliacoes/{id}", ID).header("X-Correlation-Id", "inválido com espaços"))
        .andExpect(header().string("X-Correlation-Id", matchesPattern("[0-9a-f-]{36}")));
  }

  @Test
  void corsSoParaAsOrigensConfiguradas() throws Exception {
    mvc.perform(
            options("/api/v1/avaliacoes")
                .header(HttpHeaders.ORIGIN, "http://localhost:4200")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
        .andExpect(status().isOk())
        .andExpect(
            header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4200"));
    mvc.perform(
            options("/api/v1/avaliacoes")
                .header(HttpHeaders.ORIGIN, "https://outro.example")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
        .andExpect(status().isForbidden());
  }
}
