import { test as base } from '@playwright/test';
import { LoginPage, InventoryPage, ProductDetailPage, CartPage, CheckoutPage } from '../pages';
import { Header } from '../components/Header';
import { UniversalChecks } from '../utils/universal-checks';
import { universalChecksConfig } from '../../config/universal-checks.config';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: Header;
  universalChecks: UniversalChecks;
  autoUniversalChecks: void;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  header: async ({ page }, use) => {
    await use(new Header(page));
  },
  universalChecks: async ({ page }, use) => {
    const checks = new UniversalChecks(page);
    checks.startConsoleCollection();
    await use(checks);
  },
  autoUniversalChecks: [
    async ({ page }, use, testInfo) => {
      if (!universalChecksConfig.enabled) {
        await use();
        return;
      }
      const checks = new UniversalChecks(page);
      checks.startConsoleCollection();
      await use();
      // Run the checks once, awaited, on the page the test finished on. Running them from a
      // fire-and-forget 'load' listener raced the test itself (axe evaluating on a closing
      // page) and could not fail the test reliably. Skip when the test already failed so the
      // original error is the one reported.
      if (
        testInfo.status === testInfo.expectedStatus &&
        testInfo.expectedStatus === 'passed' &&
        !testInfo.tags.includes('@skip-universal') &&
        !page.isClosed() &&
        page.url().startsWith('http')
      ) {
        await checks.runAll();
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
