import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ColaboradorDto } from '../../api/models';
import { FUNCAO, rotulo } from '../../shared/rotulos';
import { ErroApresentavel, erroApresentavel } from '../erros';
import { Autenticacao } from './autenticacao';

/**
 * Entrada em desenvolvimento: escolher um colaborador de exemplo ou indicar um. Em produção a
 * entrada é feita no fornecedor OIDC (ADR 0009).
 */
@Component({
  selector: 'lv-entrar',
  imports: [FormsModule],
  templateUrl: './entrar.html',
})
export class Entrar {
  private readonly autenticacao = inject(Autenticacao);
  private readonly router = inject(Router);

  /** URL a que se volta depois de entrar */
  readonly destino = input<string>();

  protected readonly funcoes = Object.keys(FUNCAO) as ColaboradorDto['funcao'][];
  protected readonly rotuloFuncao = (f: string) => rotulo(FUNCAO, f);
  protected readonly exemplos = signal<ColaboradorDto[]>([]);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly aEntrar = signal(false);
  protected readonly outro: ColaboradorDto = {
    id: '',
    nome: '',
    funcao: 'KEY_HOLDER',
    aprovadoPeloDM: false,
    idCredencialPOS: '',
  };

  constructor() {
    this.autenticacao
      .colaboradoresExemplo()
      .then((lista) => this.exemplos.set(lista))
      .catch((e: unknown) => this.erro.set(erroApresentavel(e)));
  }

  protected async entrar(colaborador: ColaboradorDto): Promise<void> {
    this.aEntrar.set(true);
    this.erro.set(null);
    try {
      await this.autenticacao.entrar({
        ...colaborador,
        nome: colaborador.nome || undefined,
        idCredencialPOS: colaborador.idCredencialPOS || undefined,
      });
      await this.router.navigateByUrl(this.destino() || '/avaliacao');
    } catch (e) {
      this.erro.set(erroApresentavel(e));
    } finally {
      this.aEntrar.set(false);
    }
  }
}
