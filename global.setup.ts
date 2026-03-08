import { chromium } from '@playwright/test';
import { ENV } from './config/env';
import * as fs from 'fs';

async function globalSetup() {
  const authDir = '.auth';
  fs.mkdirSync(authDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(ENV.BASE_URL);
  await page.fill('[data-test="username"]', ENV.STANDARD_USER);
  await page.fill('[data-test="password"]', ENV.PASSWORD);
  await page.click('[data-test="login-button"]');

  try {
    await page.waitForURL('**/inventory.html', { timeout: 15_000 });
  } catch {
    const errorEl = page.locator('[data-test="error"]');
    const msg = (await errorEl.isVisible())
      ? await errorEl.textContent()
      : 'No error element found';
    const currentUrl = page.url();
    await browser.close();
    throw new Error(`Global setup login failed. Error: "${msg}". URL: ${currentUrl}`);
  }

  await page.context().storageState({ path: `${authDir}/standard-user.json` });
  await browser.close();
}

export default globalSetup;
