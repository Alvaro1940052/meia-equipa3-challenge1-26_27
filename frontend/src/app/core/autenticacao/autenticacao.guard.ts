import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Autenticacao } from './autenticacao';

/** Só entra quem tem sessão; os outros vão para o ecrã de entrada e voltam depois. */
export const autenticacaoGuard: CanActivateFn = (_rota, estado) => {
  const autenticacao = inject(Autenticacao);
  if (autenticacao.token()) {
    return true;
  }
  return inject(Router).createUrlTree(['/entrar'], { queryParams: { destino: estado.url } });
};
