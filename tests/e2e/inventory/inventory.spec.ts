import { test, expect } from '../../../src/fixtures';
import { PRODUCTS } from '../../../src/data/products';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('should display 6 products @smoke @regression', async ({ inventoryPage }) => {
    expect(await inventoryPage.getProductCount()).toBe(6);
  });

  test('should display all expected product names @regression', async ({ inventoryPage }) => {
    const names = await inventoryPage.getProductNames();
    for (const product of PRODUCTS) {
      expect(names).toContain(product.name);
    }
  });

  test('should sort products A to Z @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getProductNames();
    expect(names).toEqual([...names].sort());
  });

  test('should sort products Z to A @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('should sort products price low to high @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('should sort products price high to low @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('should add a product to cart and update badge count @smoke @regression', async ({
    inventoryPage,
    header,
  }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    expect(await header.getCartCount()).toBe(1);
  });

  test('should add multiple products to cart @regression', async ({ inventoryPage, header }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bike Light');
    expect(await header.getCartCount()).toBe(2);
  });

  test('should remove a product from cart via inventory page @regression', async ({
    inventoryPage,
    header,
  }) => {
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.removeFromCartByName('Sauce Labs Backpack');
    expect(await header.getCartCount()).toBe(0);
  });
});
