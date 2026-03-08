import { test, expect } from '../../src/fixtures';
import { collectWebVitals } from '../../src/utils/performance';

test.describe('Performance: Web Vitals', () => {
  test('inventory page should meet performance budgets @performance @regression', async ({
    inventoryPage,
    page,
  }) => {
    await inventoryPage.goto();
    await page.waitForLoadState('load');

    const vitals = await collectWebVitals(page);

    // Performance budgets
    expect(vitals.ttfb, `TTFB: ${vitals.ttfb}ms`).toBeLessThan(800);
    expect(
      vitals.domContentLoaded,
      `DOM Content Loaded: ${vitals.domContentLoaded}ms`,
    ).toBeLessThan(3000);
    expect(vitals.loadComplete, `Load Complete: ${vitals.loadComplete}ms`).toBeLessThan(5000);

    if (vitals.fcp) {
      expect(vitals.fcp, `FCP: ${vitals.fcp}ms`).toBeLessThan(2000);
    }
  });

  test('login page should meet performance budgets @performance @regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const vitals = await collectWebVitals(page);

    expect(vitals.ttfb, `TTFB: ${vitals.ttfb}ms`).toBeLessThan(800);
    expect(
      vitals.domContentLoaded,
      `DOM Content Loaded: ${vitals.domContentLoaded}ms`,
    ).toBeLessThan(3000);
    expect(vitals.loadComplete, `Load Complete: ${vitals.loadComplete}ms`).toBeLessThan(5000);
  });
});
