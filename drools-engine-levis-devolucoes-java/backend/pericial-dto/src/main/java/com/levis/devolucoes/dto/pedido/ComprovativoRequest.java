package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.TipoComprovativo;

/** Comprovativo de compra apresentado (IN-004). */
public record ComprovativoRequest(
    TipoComprovativo tipo,
    boolean confirmaCompra,
    boolean reciboOriginal,
    boolean clienteMantemRecibo,
    boolean incluiOutrosArtigos) {}
