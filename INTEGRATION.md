# Integration Guide — Playwright + Full QA Ecosystem

## How This Framework Connects

```
ai-test-orchestrator → Generates Playwright tests automatically
         ↓
playwright-enterprise-framework  ← YOU ARE HERE
         ↓
test-observability-platform → Aggregates results with other frameworks
         ↓
flaky-test-detective → Detects flaky tests, quarantines them
         ↓
n8n-enterprise-workflows → Notifies Slack/Jira on failures
```

## With test-data-factory

```typescript
import { userFactory } from 'test-data-factory';

test('register with generated data', async ({ page }) => {
  const user = userFactory.build();
  await page.goto('/register');
  await page.fill('#name', user.firstName);
  await page.fill('#email', user.email);
  await page.click('button[type="submit"]');
});
```

## With chaos-testing-toolkit

```bash
# Start chaos proxy
npx chaos proxy resilience.json --target http://api.staging.com --port 4001

# Run Playwright through the proxy
BASE_URL=http://localhost:4001 npx playwright test tests/resilience/
```

## With visual-regression-toolkit

```typescript
import { VrtRunner } from 'visual-regression-toolkit';

test('homepage visual check', async ({ page }) => {
  await page.goto('/');
  const buffer = await page.screenshot({ fullPage: true });
  const runner = new VrtRunner();
  const result = runner.check('homepage', buffer);
  expect(result.status).not.toBe('fail');
});
```

## CI Pipeline

```yaml
- run: npx playwright test --reporter=json > results/pw.json
- run: npx testobs ingest results/pw.json
- run: npx flaky-detective analyze results/pw.json
```
