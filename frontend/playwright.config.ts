import { defineConfig, devices } from '@playwright/test';

/**
 * Testes ponta a ponta: o frontend (ng serve, com proxy para a API) e a API com PostgreSQL
 * (docker compose). Se já estiverem a correr, são reutilizados. Com E2E_URL definido (ex.:
 * http://localhost:8081/pt-PT/, a imagem nginx), os testes correm contra esse endereço e nada é arrancado.
 */
const url = process.env['E2E_URL'];

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env['CI'] ? 2 : 3,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    // Com barra final: os testes usam caminhos relativos (ex.: http://localhost:8081/pt-PT/)
    baseURL: url ?? 'http://localhost:4200/',
    locale: 'pt-PT',
    testIdAttribute: 'data-teste',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: url
    ? undefined
    : [
        {
          command: 'docker compose up --build postgres api',
          cwd: '..',
          url: 'http://localhost:8080/actuator/health',
          reuseExistingServer: true,
          timeout: 600_000,
        },
        {
          command: 'npm start',
          url: 'http://localhost:4200',
          reuseExistingServer: true,
          timeout: 180_000,
        },
      ],
});
