package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.enums.TipoTransacao;
import jakarta.validation.Valid;

/**
 * Pedido de exceção do cliente e decisão da gestão (EX-001 a EX-007, HS-005).
 *
 * @param concluivelNoSistema o resultado pode ser concluído no sistema; vazio conta como sim
 * @param aprovada decisão da gestão; vazio enquanto pendente
 */
public record PedidoExcecaoRequest(
    String motivo,
    TipoTransacao resolucaoPedida,
    boolean exigeMeioProibido,
    boolean exigeSkuIncorreto,
    boolean envolveProdutoExcluido,
    boolean contornaProcessoObrigatorio,
    Boolean concluivelNoSistema,
    Boolean aprovada,
    @Valid ColaboradorDto aprovador,
    String preocupacaoCliente) {}
