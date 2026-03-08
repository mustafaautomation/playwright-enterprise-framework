import { test, expect } from '../../src/fixtures';

test.describe('Visual Regression', () => {
  test('inventory page matches snapshot @visual', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    await expect(page).toHaveScreenshot('inventory.png', { maxDiffPixels: 100 });
  });

  test('cart page matches snapshot @visual', async ({ inventoryPage, header, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await header.goToCart();
    await expect(page).toHaveScreenshot('cart.png', { maxDiffPixels: 100 });
  });

  test('checkout step one matches snapshot @visual', async ({
    inventoryPage,
    cartPage,
    header,
    page,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await header.goToCart();
    await cartPage.checkout();
    await expect(page).toHaveScreenshot('checkout-step-one.png', { maxDiffPixels: 100 });
  });
});
