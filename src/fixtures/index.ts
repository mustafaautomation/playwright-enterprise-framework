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
    async ({ page }, use) => {
      if (!universalChecksConfig.enabled) {
        await use();
        return;
      }
      const checks = new UniversalChecks(page);
      checks.startConsoleCollection();
      page.on('load', async () => {
        await checks.runAll();
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
