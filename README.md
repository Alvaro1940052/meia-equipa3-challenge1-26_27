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
- Node 22 (frontend) e Docker (ambiente local e testes de integração com Testcontainers).

## Comandos

```bash
mvn clean verify                       # build, testes, Spotless, Checkstyle, JaCoCo
mvn spotless:apply                     # formatar o código Java
mvn -pl backend/pericial-api spring-boot:run -Dspring-boot.run.profiles=dev
```

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
