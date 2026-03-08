import { defineConfig, devices } from '@playwright/test';
import { ENV } from './config/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  globalSetup: './global.setup',

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['allure-playwright'],
    ['list'],
  ],

  use: {
    baseURL: ENV.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Auth tests run without saved state (they test login itself)
    {
      name: 'auth-tests',
      testMatch: [/.*auth.*\.spec\.ts/, /.*multi-user.*\.spec\.ts/],
      use: { ...devices['Desktop Chrome'] },
    },

    // All other tests reuse saved auth state — no repeated logins
    {
      name: 'chromium',
      testIgnore: [
        /.*auth.*\.spec\.ts/,
        /.*multi-user.*\.spec\.ts/,
        /.*visual.*\.spec\.ts/,
        /.*a11y.*\.spec\.ts/,
        /.*performance.*\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard-user.json',
      },
    },
    {
      name: 'firefox',
      testIgnore: [
        /.*auth.*\.spec\.ts/,
        /.*multi-user.*\.spec\.ts/,
        /.*visual.*\.spec\.ts/,
        /.*a11y.*\.spec\.ts/,
        /.*performance.*\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/standard-user.json',
      },
    },
    {
      name: 'webkit',
      testIgnore: [
        /.*auth.*\.spec\.ts/,
        /.*multi-user.*\.spec\.ts/,
        /.*visual.*\.spec\.ts/,
        /.*a11y.*\.spec\.ts/,
        /.*performance.*\.spec\.ts/,
      ],
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/standard-user.json',
      },
    },
    {
      name: 'mobile-chrome',
      testIgnore: [
        /.*auth.*\.spec\.ts/,
        /.*multi-user.*\.spec\.ts/,
        /.*visual.*\.spec\.ts/,
        /.*a11y.*\.spec\.ts/,
        /.*performance.*\.spec\.ts/,
      ],
      use: {
        ...devices['Pixel 5'],
        storageState: '.auth/standard-user.json',
      },
    },

    // Visual regression tests — isolated project
    {
      name: 'visual',
      testMatch: /.*visual.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard-user.json',
      },
    },

    // Accessibility tests
    {
      name: 'a11y',
      testMatch: /.*a11y.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard-user.json',
      },
    },

    // Performance tests
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/standard-user.json',
      },
    },
  ],
});
