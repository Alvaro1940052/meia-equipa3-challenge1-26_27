// Verifica que as mensagens extraídas (pt-PT) e as traduções (en) coincidem: cada mensagem tem
// tradução, a tradução foi feita para o texto atual (a origem é a mesma) e não há traduções órfãs.
// Correr depois de `npm run i18n:extrair` (as localizações no código não contam).
import { readFileSync } from 'node:fs';

const unidades = (ficheiro) => {
  const texto = readFileSync(new URL(`../src/locale/${ficheiro}`, import.meta.url), 'utf8');
  return new Map(
    [...texto.matchAll(/<trans-unit id="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g)].map((m) => [
      m[1],
      {
        origem: /<source>([\s\S]*?)<\/source>/.exec(m[2])?.[1].replace(/\s+/g, ' ').trim(),
        traducao: /<target[^>]*>([\s\S]+?)<\/target>/.exec(m[2])?.[1],
      },
    ]),
  );
};

const origem = unidades('messages.pt-PT.xlf');
const ingles = unidades('messages.en.xlf');
const semTraducao = [...origem.keys()].filter((id) => !ingles.get(id)?.traducao);
const desatualizadas = [...origem.entries()]
  .filter(([id, u]) => ingles.get(id)?.traducao && ingles.get(id).origem !== u.origem)
  .map(([id]) => id);
const orfas = [...ingles.keys()].filter((id) => !origem.has(id));

const problemas = [
  [semTraducao, 'Mensagens sem tradução (en)'],
  [desatualizadas, 'Traduções feitas para um texto que mudou'],
  [orfas, 'Traduções sem mensagem de origem'],
].filter(([lista]) => lista.length);
if (problemas.length) {
  for (const [lista, titulo] of problemas) console.error(`${titulo}: ${lista.join(', ')}`);
  process.exit(1);
}
console.log(`Traduções completas: ${origem.size} mensagens.`);
