import { test, expect } from '../../../src/fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage, header, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bike Light');
    await header.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('should display all added items @smoke @regression', async ({ cartPage }) => {
    expect(await cartPage.getCartItemCount()).toBe(2);
  });

  test('should display correct item names @regression', async ({ cartPage }) => {
    const names = await cartPage.getCartItemNames();
    expect(names).toContain('Sauce Labs Backpack');
    expect(names).toContain('Sauce Labs Bike Light');
  });

  test('should display correct item prices @regression', async ({ cartPage }) => {
    const prices = await cartPage.getCartItemPrices();
    expect(prices).toContain(29.99);
    expect(prices).toContain(9.99);
  });

  test('should remove an item from cart @regression', async ({ cartPage }) => {
    await cartPage.removeItem('Sauce Labs Backpack');
    expect(await cartPage.getCartItemCount()).toBe(1);
    expect(await cartPage.getCartItemNames()).not.toContain('Sauce Labs Backpack');
  });

  test('should navigate back to inventory via continue shopping @regression', async ({
    cartPage,
    page,
  }) => {
    await cartPage.continueShopping();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should navigate to checkout step one @smoke @regression', async ({ cartPage, page }) => {
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
