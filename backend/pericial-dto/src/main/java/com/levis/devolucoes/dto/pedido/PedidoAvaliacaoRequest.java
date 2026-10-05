package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.TipoPedido;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

/**
 * Pedido de devolução, troca ou ajuste a avaliar (IN-001 a IN-010). O colaborador não vem no
 * pedido: é o utilizador autenticado (ADR 0003, A-24). Os campos que as integrações conseguem
 * consultar (POS, catálogo, BackPocket, pagamentos) podem ficar vazios.
 */
@Schema(description = "Pedido apresentado pelo cliente na loja")
public record PedidoAvaliacaoRequest(
    @Schema(description = "Identificador do pedido; gerado se vazio") String id,
    @Schema(description = "Data do pedido na loja (IN-006)") LocalDate dataPedido,
    @Schema(description = "Pedido do cliente (IN-005)") TipoPedido tipoPedido,
    @Valid LojaRequest loja,
    @Valid ClienteRequest cliente,
    @Valid CompraRequest compraOriginal,
    @Schema(description = "Comprovativo apresentado; vazio se não houver (IN-004)") @Valid
        ComprovativoRequest comprovativo,
    @NotEmpty @Valid List<ArtigoRequest> artigos,
    @Valid List<ArtigoTrocaRequest> artigosTroca,
    @Schema(
            description =
                "Portal de devoluções online disponível; consultado na BackPocket se vazio")
        Boolean portalOnlineDisponivel,
    @Schema(description = "A política permite a devolução online às cegas (CH-003)")
        Boolean politicaPermiteAsCegasOnline,
    @Valid PedidoExcecaoRequest pedidoExcecao,
    @Valid List<IndicadorFraudeRequest> indicadoresFraude) {}
