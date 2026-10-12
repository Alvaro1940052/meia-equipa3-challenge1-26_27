import { definir, obter, segmentos, semIndices } from './caminhos';

describe('caminhos', () => {
  it('decompõe caminhos com índices', () => {
    expect(segmentos('artigos[1].produto.sku')).toEqual(['artigos', 1, 'produto', 'sku']);
    expect(() => segmentos('artigos[].x')).toThrow();
  });

  it('lê valores e devolve undefined em troços inexistentes', () => {
    const pedido = { artigos: [{ produto: { sku: '501' } }] };
    expect(obter(pedido, 'artigos[0].produto.sku')).toBe('501');
    expect(obter(pedido, 'artigos[3].produto.sku')).toBeUndefined();
    expect(obter(pedido, 'loja.codigo')).toBeUndefined();
  });

  it('define sem alterar o original e cria os troços em falta', () => {
    const original = { loja: { codigo: 'A' }, artigos: [{ id: 'A-1' }] };
    const alterado = definir(original, 'artigos[1].produto.sku', '502');

    expect(original.artigos).toHaveLength(1);
    expect(obter(alterado, 'artigos[1].produto.sku')).toBe('502');
    expect(obter(alterado, 'artigos[0].id')).toBe('A-1');
    expect(alterado.loja).toBe(original.loja);
  });

  it('identifica o campo sem os índices', () => {
    expect(semIndices('artigos[12].estado.danificado')).toBe('artigos.estado.danificado');
  });
});
