package com.levis.devolucoes.dto.simulacao;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

/**
 * "E se?": alterações a aplicar ao pedido de uma avaliação, por caminho (ex.:
 * portalOnlineDisponivel, compraOriginal.pagamento.meio, artigos[0].revendivel).
 */
@Schema(description = "Alterações a simular (caminho → novo valor)")
public record SimulacaoRequest(@NotEmpty Map<String, Object> alteracoes) {}
