import { test, expect } from '../../../src/fixtures';
import { USERS } from '../../../src/data/users';

test.describe('Multi-User Scenarios', () => {
  test('problem user should login and see inventory with known glitches @regression', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await expect(page).toHaveURL(/inventory\.html/);

    // Problem user can login but product images are broken (all show the same image)
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);

    // Verify the user can at least add items to cart
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    const names = await inventoryPage.getProductNames();
    expect(names.length).toBe(6);
  });

  test('performance user should load inventory within acceptable time @regression', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto();
    const startTime = Date.now();
    await loginPage.login(USERS.performance.username, USERS.performance.password);
    await expect(page).toHaveURL(/inventory\.html/, { timeout: 15_000 });
    const loadTime = Date.now() - startTime;

    // Performance glitch user is intentionally slow, but should load within 15s
    expect(loadTime, `Login took ${loadTime}ms`).toBeLessThan(15_000);
  });

  test('standard user should see 6 products after login @smoke @regression', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    expect(await inventoryPage.getProductCount()).toBe(6);
  });

  test('locked user should not access inventory @regression', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(USERS.locked.username, USERS.locked.password);
    await expect(loginPage.errorContainer).toBeVisible();
    await expect(loginPage.errorContainer).toContainText('locked out');
    // Should NOT navigate away from login
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
