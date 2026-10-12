package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.CanalCompra;
import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

/**
 * Compra original (IN-003, IN-006, IN-009).
 *
 * @param encomendaEncontrada encomenda online localizada; consultada na BackPocket se vazio
 */
public record CompraRequest(
    String idTransacao,
    CanalCompra canal,
    LocalDate dataCompra,
    LocalDate dataEnvio,
    @Valid PagamentoRequest pagamento,
    String idStylistVenda,
    @PositiveOrZero int quantidadeComprada,
    boolean promocaoEscaloes,
    Boolean encomendaEncontrada,
    boolean ajustePrecoAplicado,
    boolean compraOferta) {}
