import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { listarRegras } from '../../api/functions';
import { RegraResumoDto } from '../../api/models';
import { ErroApresentavel, erroApresentavel } from '../../core/erros';

/** Catálogo da base de conhecimento: regras, módulos e as que estão "a validar". */
@Component({
  selector: 'lv-regras',
  imports: [FormsModule, RouterLink],
  templateUrl: './regras.html',
})
export class RegrasPagina {
  private readonly api = inject(Api);

  protected readonly regras = signal<RegraResumoDto[] | null>(null);
  protected readonly erro = signal<ErroApresentavel | null>(null);
  protected readonly filtro = signal('');
  protected readonly soAValidar = signal(false);
  protected readonly visiveis = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    return (this.regras() ?? []).filter(
      (r) =>
        (!this.soAValidar() || r.aValidar) &&
        (termo === '' ||
          (r.id ?? '').toLowerCase().includes(termo) ||
          (r.descricao ?? '').toLowerCase().includes(termo) ||
          (r.modulos ?? []).some((m) => m.toLowerCase() === termo)),
    );
  });

  constructor() {
    this.api
      .invoke(listarRegras)
      .then((r) => this.regras.set(r))
      .catch((e: unknown) => this.erro.set(erroApresentavel(e)));
  }
}
