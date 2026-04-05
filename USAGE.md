# Real-World Use Cases

## 1. E-Commerce Regression Suite

Run the full regression before every release:

```bash
# Install
npm ci && npx playwright install

# Run smoke (< 2 min)
npm run test:smoke

# Run full regression across 3 browsers
npm run test:regression

# Generate Allure report
npm run report
```

## 2. CI/CD Gate — Block Broken Deploys

Add to your GitHub Actions workflow:

```yaml
- name: Run E2E smoke tests
  run: npm run test:smoke -- --project=chromium
  env:
    BASE_URL: ${{ vars.STAGING_URL }}
    PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

If smoke fails → PR blocked. Simple.

## 3. Visual Regression with Screenshots

```typescript
import { test } from '@playwright/test';

test('homepage visual check', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

## 4. Integration with test-data-factory

```typescript
import { userFactory } from 'test-data-factory';

test('register with generated data', async ({ page }) => {
  const user = userFactory.build();
  await registerPage.fillForm(user.firstName, user.lastName, user.email);
  await registerPage.submit();
  await expect(page).toHaveURL('/dashboard');
});
```

## 5. Integration with flaky-test-detective

```bash
# After test run, analyze results for flakiness
npx playwright test --reporter=junit
npx flaky-detective analyze test-results/*.xml
```
