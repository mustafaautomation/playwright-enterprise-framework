import { test, expect } from '../../../src/fixtures';
import { PRODUCTS } from '../../../src/data/products';

test.describe('Data-Driven: Product Verification', () => {
  for (const product of PRODUCTS) {
    test(`should add "${product.name}" ($${product.price}) to cart @regression`, async ({
      inventoryPage,
      header,
      cartPage,
    }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCartByName(product.name);
      expect(await header.getCartCount()).toBe(1);

      await header.goToCart();
      const names = await cartPage.getCartItemNames();
      expect(names).toContain(product.name);

      const prices = await cartPage.getCartItemPrices();
      expect(prices).toContain(product.price);
    });
  }
});
