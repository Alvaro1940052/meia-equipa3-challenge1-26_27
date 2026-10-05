import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { LOCALE_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Autenticacao } from './autenticacao';

/**
 * Pedidos à API: token do colaborador e idioma das explicações (o da interface). Um 401 termina a
 * sessão e volta ao ecrã de entrada.
 */
export const autenticacaoInterceptor: HttpInterceptorFn = (pedido, seguinte) => {
  if (!pedido.url.startsWith('/api/')) {
    return seguinte(pedido);
  }
  const autenticacao = inject(Autenticacao);
  const router = inject(Router);
  const cabecalhos: Record<string, string> = { 'Accept-Language': inject(LOCALE_ID) };
  const token = autenticacao.token();
  if (token) {
    cabecalhos['Authorization'] = `Bearer ${token}`;
  }
  return seguinte(pedido.clone({ setHeaders: cabecalhos })).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401 && token) {
        autenticacao.sair();
        void router.navigate(['/entrar'], { queryParams: { destino: router.url } });
      }
      return throwError(() => erro);
    }),
  );
};
