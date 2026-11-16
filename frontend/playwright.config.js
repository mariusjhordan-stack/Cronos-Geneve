import { defineConfig, devices } from '@playwright/test';

// E2E contra un entorno ya levantado (dev: http://localhost:5175, docker compose: http://localhost).
// Nunca contra producción ni con credenciales reales. Ver docs/DESPLIEGUE.md.
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] }, grepInvert: /@responsive/ },
    { name: 'movil', use: { ...devices['Pixel 7'] }, grep: /@responsive/ },
  ],
});
