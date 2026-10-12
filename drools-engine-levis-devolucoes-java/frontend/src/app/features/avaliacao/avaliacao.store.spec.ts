import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApiConfiguration } from '../../api/api-configuration';
import { obter } from '../../shared/caminhos';
import { ATRASO_EM_FALTA_MS, AvaliacaoStore, descricaoDado, indicePasso } from './avaliacao.store';
import { GRUPOS, PASSOS } from './formulario';

describe('AvaliacaoStore', () => {
  let store: AvaliacaoStore;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        AvaliacaoStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApiConfiguration(''),
      ],
    });
    store = TestBed.inject(AvaliacaoStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Deixa correr o efeito e o atraso do "O que falta?". */
  function esperarEmFalta(): void {
    TestBed.tick();
    vi.advanceTimersByTime(ATRASO_EM_FALTA_MS);
  }

  it('pergunta "O que falta?" depois de uma pausa, com os objetos opcionais vazios', () => {
    esperarEmFalta();

    const pedido = http.expectOne('/api/v1/avaliacoes/dados-em-falta');
    expect(pedido.request.method).toBe('POST');
    expect(pedido.request.body.comprovativo).toBeNull();
    expect(pedido.request.body.artigos).toHaveLength(1);
  });

  it('agrupa uma série de alterações num só pedido e ignora respostas antigas', async () => {
    esperarEmFalta();
    const primeiro = http.expectOne('/api/v1/avaliacoes/dados-em-falta');

    store.definir('loja.mercado', 'EUA');
    TestBed.tick();
    store.definir('loja.tipoLoja', 'OUTLET');
    esperarEmFalta();
    const segundo = http.expectOne('/api/v1/avaliacoes/dados-em-falta');
    expect(segundo.request.body.loja.tipoLoja).toBe('OUTLET');

    segundo.flush({ dados: [], completo: true, resumo: 'novo' });
    primeiro.flush({ dados: [], completo: false, resumo: 'antigo' });
    await vi.runAllTimersAsync();

    expect(store.emFalta()?.resumo).toBe('novo');
    expect(store.completo()).toBe(true);
  });

  it('acrescenta e remove artigos, numerando-os', () => {
    const artigos = GRUPOS.find((g) => g.id === 'artigos')!;

    store.adicionar(artigos);
    store.adicionar(artigos);
    expect(obter(store.pedido(), 'artigos[2].id')).toBe('A-3');

    store.remover(artigos, 0);
    expect(store.pedido().artigos.map((a) => a.id)).toEqual(['A-2', 'A-3']);
  });

  it('esquece as explicações "Porquê?" quando o pedido muda', async () => {
    const pedido = store.explicarPorque('IN-010');
    http
      .expectOne((r) => r.url === '/api/v1/avaliacoes/porque' && r.params.get('dado') === 'IN-010')
      .flush({
        dado: 'IN-010',
        resumo: 'Para decidir PC-002',
      });
    await pedido;
    expect(store.porques()['IN-010']).toMatchObject({ dado: 'IN-010' });

    store.definir('artigos[0].revendivel', true);
    expect(store.porques()).toEqual({});
  });

  it('avalia e devolve o identificador, ou guarda o erro da API', async () => {
    const ok = store.avaliar();
    http.expectOne('/api/v1/avaliacoes').flush({ avaliacaoId: 'abc' });
    expect(await ok).toBe('abc');

    const recusado = store.avaliar();
    http
      .expectOne('/api/v1/avaliacoes')
      .flush(
        { title: 'Pedido inválido', detail: 'Faltam dados', erros: ['IN-001 loja.mercado'] },
        { status: 422, statusText: 'Unprocessable Entity' },
      );
    expect(await recusado).toBeNull();
    expect(store.erro()).toMatchObject({ estado: 422, erros: ['IN-001 loja.mercado'] });
    expect(store.aAvaliar()).toBe(false);
  });

  it('leva cada dado em falta ao passo onde se preenche', () => {
    const passo = (id: string) => PASSOS.findIndex((p) => p.id === id);

    expect(indicePasso('loja.mercado')).toBe(passo('pedido'));
    expect(indicePasso('compraOriginal.pagamento')).toBe(passo('compra'));
    expect(indicePasso('comprovativo')).toBe(passo('comprovativo'));
    expect(indicePasso('artigos[1].revendivel')).toBe(passo('artigos'));
    expect(indicePasso('artigos[0].produto')).toBe(passo('artigos'));
    expect(indicePasso('artigos')).toBe(passo('artigos'));
    expect(indicePasso('colaborador')).toBe(-1);
  });

  it('descreve os dados em falta com os rótulos da interface', () => {
    const pedido = store.pedido();
    const dado = (caminho: string, descricao = 'do backend') => ({
      codigo: 'IN-0',
      caminho,
      descricao,
    });

    expect(descricaoDado(dado('loja.mercado'), pedido)).toBe('Mercado');
    expect(descricaoDado(dado('artigos[0].produto.sku'), pedido)).toBe('SKU · A-1');
    expect(descricaoDado(dado('artigos[0].produto'), pedido)).toBe('Artigos devolvidos · A-1');
    expect(descricaoDado(dado('comprovativo'), pedido)).toBe(
      'Comprovativo de compra (vazio se não houver)',
    );
    expect(descricaoDado(dado('colaborador.funcao'), pedido)).toBe('do backend');
  });

  it('trata a falta de ligação como um erro apresentável', async () => {
    const pedido = store.avaliar();
    http.expectOne('/api/v1/avaliacoes').error(new ProgressEvent('error'), { status: 0 });
    await pedido;
    expect(store.erro()?.estado).toBe(0);
    expect(new HttpErrorResponse({ status: 0 }).status).toBe(0);
  });
});
