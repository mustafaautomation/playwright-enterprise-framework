import { chromium } from '@playwright/test';
import { ENV } from './config/env';
import { LoginPage } from './src/pages';
import * as fs from 'fs';

async function globalSetup() {
  const authDir = '.auth';
  fs.mkdirSync(authDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(ENV.STANDARD_USER, ENV.PASSWORD);

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
