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

    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBe(6);

    // Problem user's known glitch: all product images share the same broken src
    const images = page.locator('.inventory_item img');
    const srcs = await images.evaluateAll((imgs: HTMLImageElement[]) => imgs.map((img) => img.src));
    const uniqueSrcs = new Set(srcs);
    // All images point to the same URL — this is the documented SauceDemo bug
    expect(uniqueSrcs.size, 'Expected all product images to share the same broken src').toBe(1);
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

    // Performance glitch user is intentionally slow — verify it loaded but log the actual time
    // The URL assertion above already enforces the 15s timeout, this adds observability
    test.info().annotations.push({
      type: 'performance',
      description: `Login+load took ${loadTime}ms`,
    });
    expect(loadTime, `Login took ${loadTime}ms — exceeds 15s budget`).toBeLessThan(15_000);
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
