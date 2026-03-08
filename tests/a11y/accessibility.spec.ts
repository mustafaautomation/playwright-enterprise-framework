import { test, expect } from '../../src/fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('login page should have no critical a11y violations @a11y @regression', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical, `Found ${critical.length} critical/serious a11y violations`).toHaveLength(0);
  });

  test('inventory page should have no critical a11y violations @a11y @regression', async ({
    inventoryPage,
    page,
  }) => {
    await inventoryPage.goto();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // Exclude known SauceDemo issue: sort dropdown lacks accessible name
      .exclude('[data-test="product-sort-container"]')
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical, `Found ${critical.length} critical/serious a11y violations`).toHaveLength(0);
  });

  test('cart page should have no critical a11y violations @a11y @regression', async ({
    inventoryPage,
    header,
    page,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await header.goToCart();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical, `Found ${critical.length} critical/serious a11y violations`).toHaveLength(0);
  });

  test('checkout page should have no critical a11y violations @a11y @regression', async ({
    inventoryPage,
    header,
    cartPage,
    page,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await header.goToCart();
    await cartPage.checkout();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical, `Found ${critical.length} critical/serious a11y violations`).toHaveLength(0);
  });
});
