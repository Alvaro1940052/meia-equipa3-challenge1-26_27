import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Autenticacao, Sessao } from './autenticacao';
import { autenticacaoInterceptor } from './autenticacao.interceptor';

const SESSAO: Sessao = {
  token: 'abc.def.ghi',
  expiraEm: '2999-01-01T00:00:00Z',
  colaborador: { id: 'C-1', funcao: 'KEY_HOLDER', aprovadoPeloDM: false },
};

describe('autenticacaoInterceptor', () => {
  let http: HttpClient;
  let controlo: HttpTestingController;
  let autenticacao: Autenticacao;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([autenticacaoInterceptor])),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    });
    http = TestBed.inject(HttpClient);
    controlo = TestBed.inject(HttpTestingController);
    autenticacao = TestBed.inject(Autenticacao);
  });

  it('envia o token e o idioma da interface à API', () => {
    autenticacao.sessao.set(SESSAO);

    void firstValueFrom(http.get('/api/v1/regras'));
    const pedido = controlo.expectOne('/api/v1/regras');

    expect(pedido.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    expect(pedido.request.headers.get('Accept-Language')).toBe('en');
  });

  it('não envia o token fora da API nem com a sessão expirada', () => {
    autenticacao.sessao.set(SESSAO);
    void firstValueFrom(http.get('/assets/x.json'));
    expect(controlo.expectOne('/assets/x.json').request.headers.has('Authorization')).toBe(false);

    autenticacao.sessao.set({ ...SESSAO, expiraEm: '2000-01-01T00:00:00Z' });
    void firstValueFrom(http.get('/api/v1/regras'));
    expect(controlo.expectOne('/api/v1/regras').request.headers.has('Authorization')).toBe(false);
  });

  it('um 401 termina a sessão e volta ao ecrã de entrada', async () => {
    autenticacao.sessao.set(SESSAO);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const pedido = firstValueFrom(http.get('/api/v1/regras')).catch(() => 'recusado');
    controlo.expectOne('/api/v1/regras').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(await pedido).toBe('recusado');
    expect(autenticacao.sessao()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/entrar'], expect.anything());
  });

  it('só a gestão vê o histórico', () => {
    autenticacao.sessao.set(SESSAO);
    expect(autenticacao.podeVerHistorico()).toBe(true);
    autenticacao.sessao.set({
      ...SESSAO,
      colaborador: { ...SESSAO.colaborador, funcao: 'STYLIST' },
    });
    expect(autenticacao.podeVerHistorico()).toBe(false);
  });
});
