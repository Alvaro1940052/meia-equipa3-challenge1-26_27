// Verifica que as mensagens extraídas (pt-PT) e as traduções (en) coincidem: nenhuma mensagem sem
// tradução e nenhuma tradução órfã. Correr depois de `npm run i18n:extrair`.
import { readFileSync } from 'node:fs';

const ids = (ficheiro) => {
  const texto = readFileSync(new URL(`../src/locale/${ficheiro}`, import.meta.url), 'utf8');
  return new Map(
    [...texto.matchAll(/<trans-unit id="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
};

const origem = ids('messages.pt-PT.xlf');
const ingles = ids('messages.en.xlf');
const semTraducao = [...origem.keys()].filter(
  (id) => !/<target[^>]*>[\s\S]+?<\/target>/.test(ingles.get(id) ?? ''),
);
const orfas = [...ingles.keys()].filter((id) => !origem.has(id));

if (semTraducao.length || orfas.length) {
  if (semTraducao.length) console.error(`Mensagens sem tradução (en): ${semTraducao.join(', ')}`);
  if (orfas.length) console.error(`Traduções sem mensagem de origem: ${orfas.join(', ')}`);
  process.exit(1);
}
console.log(`Traduções completas: ${origem.size} mensagens.`);
