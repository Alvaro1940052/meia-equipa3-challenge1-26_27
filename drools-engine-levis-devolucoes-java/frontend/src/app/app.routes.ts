import { Routes } from '@angular/router';
import { autenticacaoGuard } from './core/autenticacao/autenticacao.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'avaliacao' },
  {
    path: 'entrar',
    title: $localize`:@@titulo.entrar:Entrar`,
    loadComponent: () => import('./core/autenticacao/entrar').then((m) => m.Entrar),
  },
  {
    path: '',
    canActivate: [autenticacaoGuard],
    children: [
      {
        path: 'avaliacao',
        title: $localize`:@@titulo.avaliacao:Nova avaliação`,
        loadComponent: () =>
          import('./features/avaliacao/avaliacao').then((m) => m.AvaliacaoPagina),
      },
      {
        path: 'avaliacoes/:id',
        title: $localize`:@@titulo.resultado:Decisão`,
        loadComponent: () =>
          import('./features/resultado/resultado').then((m) => m.ResultadoPagina),
      },
      {
        path: 'historico',
        title: $localize`:@@titulo.historico:Histórico`,
        loadComponent: () =>
          import('./features/historico/historico').then((m) => m.HistoricoPagina),
      },
      {
        path: 'regras',
        title: $localize`:@@titulo.regras:Base de conhecimento`,
        loadComponent: () => import('./features/regras/regras').then((m) => m.RegrasPagina),
      },
      {
        path: 'regras/:codigo',
        title: $localize`:@@titulo.regras:Base de conhecimento`,
        loadComponent: () => import('./features/regras/regra').then((m) => m.RegraPagina),
      },
    ],
  },
  { path: '**', redirectTo: 'avaliacao' },
];
