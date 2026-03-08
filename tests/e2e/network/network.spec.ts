import { test, expect } from '../../../src/fixtures';

test.describe('Network & API Validation', () => {
  test('should not make failed API requests during checkout flow @regression', async ({
    inventoryPage,
    header,
    cartPage,
    checkoutPage,
    page,
  }) => {
    const failedRequests: string[] = [];
    page.on('response', (response) => {
      const resourceType = response.request().resourceType();
      // Only track XHR/fetch API requests, not document navigations or static assets
      if (response.status() >= 400 && ['xhr', 'fetch'].includes(resourceType)) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await header.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo({
      firstName: 'Test',
      lastName: 'User',
      postalCode: '10001',
    });
    await checkoutPage.continue();
    await checkoutPage.finish();

    expect(failedRequests, `Failed requests: ${failedRequests.join(', ')}`).toHaveLength(0);
  });

  test('should load all images without errors on inventory page @regression', async ({
    inventoryPage,
    page,
  }) => {
    const brokenImages: string[] = [];
    // Patterns for browser-initiated icon requests (favicons, manifest icons)
    const iconPatterns = [/favicon/, /icon-\d+x\d+/, /apple-touch-icon/, /manifest/];

    page.on('response', (response) => {
      const url = response.url();
      const isIcon = iconPatterns.some((pattern) => pattern.test(url));
      if (response.request().resourceType() === 'image' && response.status() >= 400 && !isIcon) {
        brokenImages.push(url);
      }
    });

    await inventoryPage.goto();
    await page.waitForLoadState('networkidle');

    expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
  });

  test('should block analytics and track page performance @regression', async ({ page }) => {
    // Block third-party analytics
    await page.route('**/*google-analytics*/**', (route) => route.abort());
    await page.route('**/*facebook*/**', (route) => route.abort());

    await page.goto('/inventory.html');
    await page.waitForLoadState('networkidle');

    // Collect navigation timing
    const navEntries = await page.evaluate(() => performance.getEntriesByType('navigation'));
    expect(navEntries.length).toBeGreaterThan(0);

    const nav = navEntries[0];
    // Page should load within 5 seconds
    expect(nav.loadEventEnd - nav.startTime).toBeLessThan(5000);
  });
});
