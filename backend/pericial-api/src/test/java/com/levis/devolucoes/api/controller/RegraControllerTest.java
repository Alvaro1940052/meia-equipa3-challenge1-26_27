package com.levis.devolucoes.api.controller;

import static com.levis.devolucoes.api.Exemplos.bearer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.levis.devolucoes.api.Exemplos;
import com.levis.devolucoes.api.TesteController;
import com.levis.devolucoes.api.seguranca.EmissorTokens;
import com.levis.devolucoes.dto.enums.Funcao;
import com.levis.devolucoes.dto.regra.RegraDetalheDto;
import com.levis.devolucoes.dto.regra.RegraResumoDto;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import com.levis.devolucoes.service.regra.CatalogoRegrasService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@TesteController({RegraController.class, DesenvolvimentoController.class})
class RegraControllerTest {

  @Autowired private MockMvc mvc;
  @Autowired private EmissorTokens emissor;
  @Autowired private ObjectMapper json;
  @MockitoBean private CatalogoRegrasService catalogo;

  @Test
  void listaERegraAValidar() throws Exception {
    when(catalogo.listar())
        .thenReturn(List.of(new RegraResumoDto("CH-004", List.of("ONLINE"), "d", 1, true)));
    when(catalogo.detalhe("CH-004")).thenReturn(new RegraDetalheDto("CH-004", List.of()));

    mvc.perform(
            get("/api/v1/regras")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].aValidar").value(true));
    mvc.perform(
            get("/api/v1/regras/CH-004")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("CH-004"));
  }

  @Test
  void regraInexistenteDa404() throws Exception {
    when(catalogo.detalhe("XX-999")).thenThrow(new RecursoNaoEncontradoException("Regra"));

    mvc.perform(
            get("/api/v1/regras/XX-999")
                .header(HttpHeaders.AUTHORIZATION, bearer(emissor, Funcao.STYLIST)))
        .andExpect(status().isNotFound());
  }

  /** Fora do perfil dev não há emissão de tokens (em produção vêm do fornecedor OIDC). */
  @Test
  void semPerfilDevNaoHaEmissaoDeTokens() throws Exception {
    mvc.perform(
            post("/api/v1/dev/tokens")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Exemplos.colaborador(Funcao.GESTAO_LOJA, false))))
        .andExpect(status().isNotFound());
  }
}
