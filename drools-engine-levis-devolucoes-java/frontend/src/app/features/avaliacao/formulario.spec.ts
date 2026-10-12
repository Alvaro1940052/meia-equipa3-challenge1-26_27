import openapi from '../../../../openapi/openapi.json';
import { semIndices } from '../../shared/caminhos';
import { Campo, GRUPOS, PASSOS, caminhoCompleto } from './formulario';

interface Esquema {
  type?: string;
  $ref?: string;
  enum?: string[];
  items?: Esquema;
  properties?: Record<string, Esquema>;
}

const esquemas = (openapi as unknown as { components: { schemas: Record<string, Esquema> } })
  .components.schemas;

function resolver(e: Esquema): Esquema {
  return e.$ref ? esquemas[e.$ref.split('/').pop()!] : e;
}

/** Folhas do pedido da API (caminho sem índices → esquema). */
function folhas(
  e: Esquema,
  prefixo = '',
  resultado = new Map<string, Esquema>(),
): Map<string, Esquema> {
  for (const [nome, propriedade] of Object.entries(resolver(e).properties ?? {})) {
    const caminho = prefixo ? `${prefixo}.${nome}` : nome;
    const p = resolver(propriedade);
    if (p.properties) {
      folhas(p, caminho, resultado);
    } else if (p.type === 'array' && p.items && resolver(p.items).properties) {
      folhas(resolver(p.items), caminho, resultado);
    } else {
      resultado.set(caminho, p);
    }
  }
  return resultado;
}

const camposDoFormulario = new Map<string, Campo>(
  GRUPOS.flatMap((g) =>
    g.campos.map((c) => [semIndices(caminhoCompleto(g, c)), c] as [string, Campo]),
  ),
);

describe('formulário do pedido', () => {
  const api = folhas(esquemas['PedidoAvaliacaoRequest']);

  it('tem um campo para cada dado do pedido da API, e só esses', () => {
    expect([...camposDoFormulario.keys()].sort()).toEqual([...api.keys()].sort());
  });

  it('oferece exatamente os valores de cada enum da API', () => {
    for (const [caminho, esquema] of api) {
      const campo = camposDoFormulario.get(caminho)!;
      if (esquema.enum) {
        expect(campo.tipo, caminho).toBe('opcoes');
        expect(Object.keys(campo.opcoes!).sort(), caminho).toEqual([...esquema.enum].sort());
      }
    }
  });

  it('usa o tipo de controlo que corresponde ao tipo da API', () => {
    for (const [caminho, esquema] of api) {
      const tipo = camposDoFormulario.get(caminho)!.tipo;
      if (esquema.type === 'boolean') {
        expect(['booleano', 'booleano-opcional'], caminho).toContain(tipo);
      } else if (esquema.type === 'number') {
        expect(tipo, caminho).toBe('decimal');
      } else if (esquema.type === 'integer') {
        expect(tipo, caminho).toBe('inteiro');
      } else if (esquema.type === 'array') {
        expect(tipo, caminho).toBe('lista');
      }
    }
  });

  it('identifica cada grupo e cada passo de forma única', () => {
    expect(new Set(GRUPOS.map((g) => g.id)).size).toBe(GRUPOS.length);
    expect(new Set(PASSOS.map((p) => p.id)).size).toBe(PASSOS.length);
  });
});
