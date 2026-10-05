import { test } from '@playwright/test';
import { avaliar, entrarComo, lerCenarios, preencherPedido, verificarDecisao } from './apoio';

/**
 * Os 10 cenários de teste de esforço (docs/06) pela interface: o colaborador do cenário entra,
 * preenche o assistente e obtém a decisão esperada (resultados "a validar" pela operação).
 */
for (const cenario of lerCenarios()) {
  test(`cenário ${cenario.numero}: ${cenario.titulo}`, async ({ page }) => {
    await entrarComo(page, cenario.colaborador);
    await preencherPedido(page, cenario.pedido);
    await avaliar(page);
    await verificarDecisao(page, cenario.esperado);
  });
}
