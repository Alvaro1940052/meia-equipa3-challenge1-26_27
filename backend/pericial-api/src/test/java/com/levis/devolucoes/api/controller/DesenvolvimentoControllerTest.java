package com.levis.devolucoes.api.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.levis.devolucoes.api.TesteController;
import com.levis.devolucoes.service.regra.CatalogoRegrasService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@TesteController({DesenvolvimentoController.class, RegraController.class})
@ActiveProfiles({"test", "dev"})
class DesenvolvimentoControllerTest {

  @Autowired private MockMvc mvc;
  @Autowired private ObjectMapper json;
  @MockitoBean private CatalogoRegrasService catalogo;

  @Test
  void listaUmColaboradorDeExemploPorFuncaoSemAutenticacao() throws Exception {
    mvc.perform(get("/api/v1/dev/colaboradores"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(DesenvolvimentoController.COLABORADORES.size()));
  }

  @Test
  void oTokenEmitidoDaAcessoAApi() throws Exception {
    when(catalogo.listar()).thenReturn(List.of());
    String corpo =
        mvc.perform(
                post("/api/v1/dev/tokens")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        json.writeValueAsString(DesenvolvimentoController.COLABORADORES.get(0))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.expiraEm").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();
    JsonNode token = json.readTree(corpo);

    mvc.perform(
            get("/api/v1/regras")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token.get("token").asText()))
        .andExpect(status().isOk());
  }
}
