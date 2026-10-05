// Copia o documento OpenAPI exportado pelos testes da API (CenariosApiIT) para openapi/openapi.json,
// de onde `npm run api:gerar` gera o cliente em src/app/api.
import { copyFileSync, existsSync } from 'node:fs';

const origem = new URL('../../backend/pericial-api/target/openapi.json', import.meta.url);
const destino = new URL('../openapi/openapi.json', import.meta.url);

if (!existsSync(origem)) {
  console.error(
    'Não existe backend/pericial-api/target/openapi.json: corra antes `mvn verify` na raiz (precisa de Docker).',
  );
  process.exit(1);
}
copyFileSync(origem, destino);
console.log('openapi/openapi.json atualizado.');
