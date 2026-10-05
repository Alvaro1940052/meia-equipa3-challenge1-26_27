package com.levis.devolucoes.explicacao.porquenao;

import com.levis.devolucoes.explicacao.catalogo.CampoSaida;
import java.util.List;

/**
 * "Porque não?" de uma conclusão: porque é que o campo de saída não tem o valor indicado.
 *
 * @param campo campo de saída
 * @param valor valor perguntado (ex.: PERMITIR)
 * @param artigoId artigo, ou nulo para o pedido
 * @param valorObtido valor final do campo
 * @param obtida o valor perguntado foi obtido
 * @param propostaPor regras que chegaram a produzir o valor perguntado
 * @param definidoPor regra que fixou o valor final, ou nula
 * @param regras explicação, por regra capaz de produzir o valor, de não o ter produzido
 * @param resumo texto para o colaborador
 */
public record ExplicacaoPorqueNaoConclusao(
    CampoSaida campo,
    String valor,
    String artigoId,
    Object valorObtido,
    boolean obtida,
    List<String> propostaPor,
    String definidoPor,
    List<ExplicacaoPorqueNao> regras,
    String resumo) {}
