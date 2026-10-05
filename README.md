# Sistema pericial de devoluções e trocas Levi's

Sistema pericial usado pelos colaboradores das lojas Levi's (Mainline e Outlet, EUA e Canadá) para decidir
devoluções, trocas e ajustes de preço, e para explicar cada decisão (Como, Porquê, Porque não, E se, O que falta).

## Documentação

- `docs/01` a `docs/06`: base de conhecimento, regras IF/THEN, fluxograma, modelo, estrutura e cenários de teste.
- `docs/07-plano.md`: plano de implementação por fases.
- `docs/adr/`: decisões de arquitetura e ambiguidades por validar (`0003-ambiguidades.md`).

## Requisitos

- JDK 21 ou superior (o código é compilado com `release 21`).
- Maven 3.9 ou superior.
- Node 24 LTS (frontend; o Angular 22 exige pelo menos 22.22.3) e Docker (ambiente local e testes de integração
  com Testcontainers).

## Comandos

```bash
mvn clean verify                       # build, testes, Spotless, Checkstyle, JaCoCo, ArchUnit
mvn spotless:apply                     # formatar o código Java
docker compose up --build              # PostgreSQL + API (perfil dev, :8080) + frontend (:8081)
```

Para correr a API fora do Docker: `docker compose up -d postgres`, `mvn install -DskipTests` e
`mvn -pl backend/pericial-api spring-boot:run -Dspring-boot.run.profiles=dev`.

## Frontend

```bash
cd frontend && npm ci
npm start                 # http://localhost:4200, com proxy de /api para localhost:8080
npm run start:en          # a versão inglesa
npm test                  # testes unitários (Vitest)
npx playwright test       # E2E: os 10 cenários e as explicações (arranca a API com docker compose se preciso)
npm run api:atualizar     # copia o OpenAPI exportado pelos testes da API e regenera src/app/api
npm run i18n:extrair      # extrai as mensagens (pt-PT); traduzir em src/locale/messages.en.xlf
npm run verificar         # formatação (Prettier) e traduções completas
```

## API

- Swagger UI (dev): http://localhost:8080/swagger-ui.html; documento OpenAPI em `/v3/api-docs`, exportado
  pelos testes para `backend/pericial-api/target/openapi.json`.
- Autenticação por token JWT (`Authorization: Bearer ...`). Em dev, `GET /api/v1/dev/colaboradores` lista
  colaboradores de exemplo e `POST /api/v1/dev/tokens` emite um token para um deles. Em produção, os tokens vêm
  do fornecedor OIDC (ver `docs/adr/0008-api-e-seguranca.md`).
- O idioma das explicações segue o cabeçalho `Accept-Language` (pt-PT por omissão, ou en).

## Módulos

| Módulo | Papel |
|---|---|
| `backend/pericial-model` | Factos do domínio (POJO, sem Spring/JPA) |
| `backend/pericial-rules` | Regras DRL (kjar versionado) e cenários de aceitação |
| `backend/pericial-explanation` | Explicações das decisões |
| `backend/pericial-dto` | Contratos da API |
| `backend/pericial-persistence` | Histórico e auditoria (JPA + Flyway) |
| `backend/pericial-service` | Orquestração, motor de regras, integrações |
| `backend/pericial-api` | Aplicação Spring Boot (REST) |
| `frontend` | Angular |
