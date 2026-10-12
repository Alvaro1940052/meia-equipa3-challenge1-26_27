import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DecisaoResponse } from '../../api/models';
import { CartaoDecisao } from './cartao-decisao';

const DECISAO: DecisaoResponse = {
  avaliacaoId: '7b0c1f8e-2a54-4c39-9c51-6a0d3b2f1e10',
  pedidoId: 'C06',
  elegibilidade: 'REVER',
  tipoVerificacao: 'AS_CEGAS',
  tipoTransacao: 'CREDITO_LOJA',
  valorDevolucao: 59.5,
  baseValor: 'PRECO_ATUAL',
  meioReembolso: 'CREDITO_LOJA',
  terminal: false,
  excecaoRecusada: true,
  artigos: [
    { artigoId: 'A-1', elegibilidade: 'PERMITIR', destino: 'AREA_VENDAS' },
    { artigoId: 'A-2', elegibilidade: 'RECUSAR', destino: 'RISCO_BIOLOGICO' },
  ],
  regras: [],
  regrasAValidar: ['PT-005'],
};

describe('CartaoDecisao', () => {
  async function mostrar(decisao: DecisaoResponse): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(CartaoDecisao);
    fixture.componentRef.setInput('decisao', decisao);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('mostra a elegibilidade com a cor do fluxograma e o valor para os testes', async () => {
    const cartao = await mostrar(DECISAO);

    expect(cartao.querySelector('article')!.classList).toContain('rever');
    const elegibilidade = cartao.querySelector('.decisao-cabecalho [data-saida="elegibilidade"]')!;
    expect(elegibilidade.getAttribute('data-valor')).toBe('REVER');
    expect(elegibilidade.textContent!.trim()).toBe('Rever');
  });

  it('mostra as conclusões, o resultado por artigo e as regras a validar', async () => {
    const cartao = await mostrar(DECISAO);

    expect(cartao.querySelector('[data-saida="meioReembolso"]')!.textContent).toContain(
      'Crédito de loja',
    );
    expect(cartao.querySelector('[data-saida="valorDevolucao"]')!.textContent).toContain('59,50');
    expect(cartao.querySelector('[data-saida="excecaoRecusada"]')).not.toBeNull();
    expect(cartao.querySelector('[data-saida="terminal"]')).toBeNull();
    expect(
      cartao
        .querySelector('tr[data-artigo="A-2"] [data-saida="destino"]')!
        .getAttribute('data-valor'),
    ).toBe('RISCO_BIOLOGICO');
    expect(cartao.querySelector('[data-teste="regras-a-validar"]')!.textContent).toContain(
      'PT-005',
    );
  });

  it('mostra "—" nas conclusões sem valor', async () => {
    const cartao = await mostrar({ ...DECISAO, processo: undefined, artigos: [] });

    expect(cartao.querySelector('[data-saida="processo"]')!.textContent!.trim()).toBe('—');
    expect(cartao.querySelector('tr[data-artigo]')).toBeNull();
  });
});
