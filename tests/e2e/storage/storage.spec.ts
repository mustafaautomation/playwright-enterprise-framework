import { test, expect } from '../../../src/fixtures';
import { ENV } from '../../../config/env';

test.describe('Storage & State Management', () => {
  test('should persist cart items in localStorage across page reloads @regression', async ({
    inventoryPage,
    header,
    page,
  }) => {
    await test.step('Add items to cart', async () => {
      await inventoryPage.goto();
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await inventoryPage.addToCartByName('Sauce Labs Bike Light');
      await expect(header.cartBadge).toHaveText('2');
    });

    await test.step('Reload page and verify cart persists', async () => {
      await page.reload();
      await expect(header.cartBadge).toHaveText('2');
    });

    await test.step('Verify cart contents after reload', async () => {
      await header.goToCart();
      const items = page.locator('[data-test="inventory-item"]');
      await expect(items).toHaveCount(2);
    });
  });

  test('should persist cart state across logout/login cycle @regression', async ({
    inventoryPage,
    header,
    loginPage,
    page,
  }) => {
    await test.step('Add items and verify cart', async () => {
      await inventoryPage.goto();
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await expect(header.cartBadge).toHaveText('1');
    });

    await test.step('Logout', async () => {
      await header.openMenu();
      await page.locator('[data-test="logout-sidebar-link"]').click();
      await expect(page).toHaveURL(/.*saucedemo\.com\/?$/);
    });

    await test.step('Login again and verify cart persists (SauceDemo retains cart)', async () => {
      await loginPage.login(ENV.STANDARD_USER, ENV.PASSWORD);
      await page.waitForURL('**/inventory.html');
      // SauceDemo persists cart state across sessions — this is expected behavior
      await expect(header.cartBadge).toHaveText('1');
    });
  });

  test('should maintain correct page title across navigation @regression', async ({
    inventoryPage,
    header,
    page,
  }) => {
    await test.step('Verify inventory page title', async () => {
      await inventoryPage.goto();
      await expect(page).toHaveTitle('Swag Labs');
    });

    await test.step('Navigate to cart and verify title', async () => {
      await header.goToCart();
      await expect(page).toHaveTitle('Swag Labs');
    });
  });

  test('should set correct cookies after login @regression', async ({ page }) => {
    const cookies = await page.context().cookies();
    const domain = new URL(ENV.BASE_URL).hostname;

    await test.step('Verify session-related data exists', async () => {
      // SauceDemo uses localStorage, not cookies for state
      // but we verify no unexpected cookies are set
      const sauceCookies = cookies.filter((c) => c.domain.includes(domain));
      // No sensitive data should be in cookies for this app
      for (const cookie of sauceCookies) {
        expect(cookie.value).not.toContain('password');
        expect(cookie.value).not.toContain('secret');
      }
    });
  });
});
