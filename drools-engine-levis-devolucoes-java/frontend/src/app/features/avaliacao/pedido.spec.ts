import { obter } from '../../shared/caminhos';
import { GRUPOS } from './formulario';
import {
  itemInicial,
  paraEnvio,
  pedidoInicial,
  textoDoControlo,
  valorDoControlo,
  vazio,
} from './pedido';

const campo = (caminho: string) =>
  GRUPOS.flatMap((g) => g.campos).find((c) => c.caminho === caminho)!;

describe('pedido', () => {
  it('começa com um artigo, a data de hoje e os booleanos a falso', () => {
    const pedido = pedidoInicial('2026-10-05');

    expect(pedido.dataPedido).toBe('2026-10-05');
    expect(pedido.artigos).toHaveLength(1);
    expect(pedido.artigos[0].id).toBe('A-1');
    expect(obter(pedido, 'artigos[0].estado.danificado')).toBe(false);
    expect(obter(pedido, 'artigos[0].revendivel')).toBeNull();
    expect(pedido.artigosTroca).toEqual([]);
    expect(obter(pedido, 'loja.skusSortido')).toEqual([]);
  });

  it('numera os novos artigos', () => {
    const grupo = GRUPOS.find((g) => g.id === 'artigos')!;
    expect(itemInicial(grupo, 3)['id']).toBe('A-3');
  });

  it('envia vazios os objetos opcionais por preencher (devolução às cegas, sem exceção)', () => {
    const enviado = paraEnvio(pedidoInicial('2026-10-05'));

    expect(enviado.comprovativo).toBeNull();
    expect(enviado.pedidoExcecao).toBeNull();
    expect(enviado.compraOriginal?.pagamento).toBeNull();
    expect(enviado.loja).not.toBeNull();
  });

  it('mantém o objeto opcional quando tem algum dado', () => {
    const pedido = pedidoInicial();
    pedido.comprovativo = { ...pedido.comprovativo!, tipo: 'RECIBO_IMPRESSO' };
    pedido.pedidoExcecao = { ...pedido.pedidoExcecao!, motivo: 'Pede crédito' };

    const enviado = paraEnvio(pedido);

    expect(enviado.comprovativo?.tipo).toBe('RECIBO_IMPRESSO');
    expect(enviado.pedidoExcecao?.motivo).toBe('Pede crédito');
    expect(enviado.pedidoExcecao?.aprovador).toBeNull();
  });

  it('converte o texto dos controlos', () => {
    expect(valorDoControlo(campo('produto.pvpOriginal'), '69,50')).toBe(69.5);
    expect(valorDoControlo(campo('quantidade'), '')).toBeNull();
    expect(valorDoControlo(campo('revendivel'), 'false')).toBe(false);
    expect(valorDoControlo(campo('revendivel'), '')).toBeNull();
    expect(valorDoControlo(campo('loja.skusSortido'), '501, 502 ,')).toEqual(['501', '502']);
    expect(valorDoControlo(campo('loja.codigo'), '  ')).toBeNull();
    expect(textoDoControlo(campo('loja.skusSortido'), ['501', '502'])).toBe('501, 502');
  });

  it('considera vazio só o que não tem dados', () => {
    expect(vazio({ a: null, b: false, c: [], d: { e: '' } })).toBe(true);
    expect(vazio({ a: 0 })).toBe(false);
  });
});
