import { test } from '../../../src/fixtures';

const DEFAULT_URLS = ['/inventory.html', '/cart.html'];

const urls = process.env.UNIVERSAL_TEST_URLS
  ? process.env.UNIVERSAL_TEST_URLS.split(',').map((u) => u.trim())
  : DEFAULT_URLS;

for (const url of urls) {
  test(`Universal checks — ${url} @universal @regression`, async ({ page, universalChecks }) => {
    await page.goto(url);
    await page.waitForLoadState('load');
    await universalChecks.runAll();
  });
}
