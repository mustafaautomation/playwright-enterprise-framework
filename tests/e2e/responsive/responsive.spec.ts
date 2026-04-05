import { test, expect } from '../../../src/fixtures';

test.describe('Responsive Design', () => {
  test('should display products in mobile viewport @regression', async ({
    inventoryPage,
    page,
  }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    await test.step('Navigate to inventory', async () => {
      await inventoryPage.goto();
    });

    await test.step('Verify products are visible', async () => {
      const products = page.locator('[data-test="inventory-item"]');
      await expect(products).toHaveCount(6);
      // Each product should be visible (stacked vertically on mobile)
      await expect(products.first()).toBeVisible();
    });

    await test.step('Verify header is accessible', async () => {
      await expect(page.locator('#react-burger-menu-btn')).toBeVisible();
      await expect(page.locator('.shopping_cart_link')).toBeVisible();
    });
  });

  test('should display products in tablet viewport @regression', async ({
    inventoryPage,
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await inventoryPage.goto();

    const products = page.locator('[data-test="inventory-item"]');
    await expect(products).toHaveCount(6);
    await expect(page.locator('.app_logo')).toBeVisible();
  });

  test('should display products in desktop viewport @regression', async ({
    inventoryPage,
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await inventoryPage.goto();

    const products = page.locator('[data-test="inventory-item"]');
    await expect(products).toHaveCount(6);
    await expect(page.locator('.app_logo')).toContainText('Swag Labs');
  });

  test('should keep cart functional across viewport changes @regression', async ({
    inventoryPage,
    header,
    page,
  }) => {
    await test.step('Add item on desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await inventoryPage.goto();
      await inventoryPage.addToCartByName('Sauce Labs Backpack');
      await expect(header.cartBadge).toHaveText('1');
    });

    await test.step('Switch to mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    await test.step('Cart should persist across viewport change', async () => {
      await expect(header.cartBadge).toHaveText('1');
    });

    await test.step('Navigate to cart on mobile', async () => {
      await header.goToCart();
      await expect(page).toHaveURL(/cart\.html/);
      const items = page.locator('[data-test="inventory-item"]');
      await expect(items).toHaveCount(1);
    });
  });
});
