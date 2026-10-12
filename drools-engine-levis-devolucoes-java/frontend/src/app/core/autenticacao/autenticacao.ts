import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ColaboradorDto } from '../../api/models';

/** Token de acesso e colaborador autenticado (o colaborador da avaliação vem sempre do token). */
export interface Sessao {
  readonly token: string;
  readonly expiraEm: string;
  readonly colaborador: ColaboradorDto;
}

interface TokenResponse {
  readonly token: string;
  readonly expiraEm: string;
}

const CHAVE = 'pericial.sessao';

/** Funções com acesso ao histórico de avaliações da loja (ADR 0008, "a validar"). */
export const FUNCOES_GESTAO: readonly ColaboradorDto['funcao'][] = [
  'GESTAO_LOJA',
  'XSTORE_MANAGER',
  'KEY_HOLDER',
];

function lerSessao(): Sessao | null {
  try {
    const texto = sessionStorage.getItem(CHAVE);
    return texto ? (JSON.parse(texto) as Sessao) : null;
  } catch {
    return null;
  }
}

/**
 * Sessão do colaborador. Em desenvolvimento, o token é emitido pela API (perfil dev) para um
 * colaborador de exemplo; em produção virá do fornecedor OIDC (ADR 0009).
 */
@Injectable({ providedIn: 'root' })
export class Autenticacao {
  private readonly http = inject(HttpClient);
  private readonly agora = signal(Date.now());

  readonly sessao = signal<Sessao | null>(lerSessao());
  readonly colaborador = computed(() => this.sessao()?.colaborador ?? null);
  readonly autenticado = computed(() => {
    const sessao = this.sessao();
    return sessao !== null && Date.parse(sessao.expiraEm) > this.agora();
  });
  readonly podeVerHistorico = computed(() =>
    FUNCOES_GESTAO.includes(this.colaborador()?.funcao ?? ('' as ColaboradorDto['funcao'])),
  );

  token(): string | null {
    this.agora.set(Date.now());
    return this.autenticado() ? this.sessao()!.token : null;
  }

  colaboradoresExemplo(): Promise<ColaboradorDto[]> {
    return firstValueFrom(this.http.get<ColaboradorDto[]>('/api/v1/dev/colaboradores'));
  }

  async entrar(colaborador: ColaboradorDto): Promise<void> {
    const resposta = await firstValueFrom(
      this.http.post<TokenResponse>('/api/v1/dev/tokens', colaborador),
    );
    const sessao: Sessao = { token: resposta.token, expiraEm: resposta.expiraEm, colaborador };
    this.guardar(sessao);
  }

  sair(): void {
    this.guardar(null);
  }

  private guardar(sessao: Sessao | null): void {
    this.agora.set(Date.now());
    this.sessao.set(sessao);
    try {
      if (sessao) {
        sessionStorage.setItem(CHAVE, JSON.stringify(sessao));
      } else {
        sessionStorage.removeItem(CHAVE);
      }
    } catch {
      // Sem armazenamento (ex.: janela privada): a sessão dura até recarregar a página.
    }
  }
}
