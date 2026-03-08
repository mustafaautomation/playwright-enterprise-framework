import { test, expect } from '../../../src/fixtures';
import { PRODUCTS } from '../../../src/data/products';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('should display correct product details @regression', async ({
    inventoryPage,
    productDetailPage,
    page,
  }) => {
    const product = PRODUCTS[0]; // Sauce Labs Backpack
    await inventoryPage.openProduct(product.name);
    await expect(page).toHaveURL(/inventory-item\.html/);

    const name = await productDetailPage.getProductName();
    expect(name).toBe(product.name);

    const price = await productDetailPage.getProductPrice();
    expect(price).toBe(product.price);

    const description = await productDetailPage.getProductDescription();
    expect(description.length).toBeGreaterThan(0);
  });

  test('should add product to cart from detail page @regression', async ({
    inventoryPage,
    productDetailPage,
    header,
  }) => {
    await inventoryPage.openProduct(PRODUCTS[0].name);
    await productDetailPage.addToCart();
    expect(await header.getCartCount()).toBe(1);
  });

  test('should remove product from cart on detail page @regression', async ({
    inventoryPage,
    productDetailPage,
    header,
  }) => {
    await inventoryPage.openProduct(PRODUCTS[0].name);
    await productDetailPage.addToCart();
    expect(await header.getCartCount()).toBe(1);
    await productDetailPage.removeFromCart();
    expect(await header.getCartCount()).toBe(0);
  });

  test('should navigate back to inventory @regression', async ({
    inventoryPage,
    productDetailPage,
    page,
  }) => {
    await inventoryPage.openProduct(PRODUCTS[0].name);
    await productDetailPage.goBack();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should display product image @regression', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.openProduct(PRODUCTS[0].name);
    const img = productDetailPage.getProductImage(PRODUCTS[0].name);
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
  });
});
