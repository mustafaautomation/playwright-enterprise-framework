import { test, expect } from '../../../src/fixtures';

test.describe('API Mocking & Route Interception', () => {
  test('should handle degraded API with mocked slow response @regression', async ({
    inventoryPage,
    page,
  }) => {
    await test.step('Intercept and delay image responses', async () => {
      await page.route('**/*.{png,jpg,jpeg}', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
      });
    });

    await test.step('Verify page still loads within budget', async () => {
      const start = Date.now();
      await inventoryPage.goto();
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - start;
      expect(loadTime, `DOM ready took ${loadTime}ms`).toBeLessThan(10_000);
    });

    await test.step('Verify products still render', async () => {
      const products = page.locator('[data-test="inventory-item"]');
      await expect(products).toHaveCount(6);
    });
  });

  test('should gracefully handle blocked static assets @regression', async ({
    inventoryPage,
    page,
  }) => {
    await test.step('Block all CSS files', async () => {
      await page.route('**/*.css', (route) => route.abort());
    });

    await test.step('Page should still render content', async () => {
      await inventoryPage.goto();
      const products = page.locator('[data-test="inventory-item"]');
      await expect(products).toHaveCount(6);
    });

    await test.step('Product names should be visible', async () => {
      const firstProduct = page.locator('[data-test="inventory-item-name"]').first();
      await expect(firstProduct).toBeVisible();
    });
  });

  test('should intercept and verify outgoing request headers @regression', async ({
    inventoryPage,
    page,
  }) => {
    const requestHeaders: Record<string, string>[] = [];

    await test.step('Capture navigation request headers', async () => {
      page.on('request', (request) => {
        if (request.resourceType() === 'document') {
          requestHeaders.push(request.headers());
        }
      });
    });

    await test.step('Navigate and verify headers', async () => {
      await inventoryPage.goto();
      expect(requestHeaders.length).toBeGreaterThan(0);
      expect(requestHeaders[0]['user-agent']).toBeDefined();
    });
  });

  test('should count total network requests during page load @regression', async ({
    inventoryPage,
    page,
  }) => {
    const requests: string[] = [];

    page.on('request', (request) => {
      requests.push(`${request.method()} ${request.resourceType()}: ${request.url()}`);
    });

    await inventoryPage.goto();
    await page.waitForLoadState('networkidle');

    await test.step('Verify reasonable request count', async () => {
      // SauceDemo is a simple app — shouldn't make excessive requests
      expect(requests.length, `Made ${requests.length} requests`).toBeLessThan(50);
      expect(requests.length).toBeGreaterThan(0);
    });
  });
});
