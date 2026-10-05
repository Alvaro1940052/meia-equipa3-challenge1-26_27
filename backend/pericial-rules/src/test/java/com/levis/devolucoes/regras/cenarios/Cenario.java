package com.levis.devolucoes.regras.cenarios;

import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import java.util.List;

/**
 * Um cenário de docs/06-casos-teste.md em JSON.
 *
 * @param id número do cenário (1 a 10)
 * @param titulo título em docs/06
 * @param estado "a validar" até a operação confirmar o resultado esperado, depois "validado"
 * @param aValidar ambiguidades do ADR 0003 que afetam o resultado esperado
 * @param pressupostos dados que docs/06 não indica e que foram fixados para o teste
 * @param justificacao raciocínio do resultado esperado a partir de docs/02, com as regras
 * @param pedido dados de entrada
 * @param indicadoresFraude indícios de fraude registados pelo colaborador
 * @param esperado resultado esperado, derivado de docs/02; só os campos presentes são verificados
 */
public record Cenario(
    int id,
    String titulo,
    String estado,
    List<String> aValidar,
    List<String> pressupostos,
    List<String> justificacao,
    PedidoDevolucao pedido,
    List<IndicadorFraude> indicadoresFraude,
    Esperado esperado) {

  @Override
  public String toString() {
    return String.format("Cenário %02d — %s", id, titulo);
  }
}
