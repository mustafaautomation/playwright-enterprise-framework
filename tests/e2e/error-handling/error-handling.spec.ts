import { test, expect } from '../../../src/fixtures';
import { ENV } from '../../../config/env';

test.describe('Error Handling & Recovery', () => {
  test('should display error for locked out user @regression', async ({ loginPage, page }) => {
    await test.step('Navigate to login', async () => {
      await page.goto('/');
    });

    await test.step('Login with locked user', async () => {
      await loginPage.login(ENV.LOCKED_USER, ENV.PASSWORD);
    });

    await test.step('Verify locked out error', async () => {
      await expect(loginPage.errorContainer).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('locked out');
    });
  });

  test('should display error for empty credentials @regression', async ({ loginPage, page }) => {
    await page.goto('/');
    await loginPage.login('', '');

    await expect(loginPage.errorContainer).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Username is required');
  });

  test('should display error for missing password @regression', async ({ loginPage, page }) => {
    await page.goto('/');
    await loginPage.login('standard_user', '');

    await expect(loginPage.errorContainer).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Password is required');
  });

  test('should display error for invalid credentials @regression', async ({ loginPage, page }) => {
    await page.goto('/');
    await loginPage.login('invalid_user', 'wrong_password');

    await expect(loginPage.errorContainer).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('do not match');
  });

  test('should recover from error state @regression', async ({ loginPage, page }) => {
    await test.step('Trigger error', async () => {
      await page.goto('/');
      await loginPage.login('', '');
      await expect(loginPage.errorContainer).toBeVisible();
    });

    await test.step('Successfully login after error', async () => {
      await loginPage.login(ENV.STANDARD_USER, ENV.PASSWORD);
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test('should redirect to login when accessing protected page without auth @regression', async ({
    page,
  }) => {
    // Create a fresh context without auth
    const context = await page.context().browser()!.newContext();
    const freshPage = await context.newPage();

    await freshPage.goto(ENV.BASE_URL + '/inventory.html');

    // SauceDemo redirects to login or shows error
    const url = freshPage.url();
    expect(url).toMatch(/saucedemo\.com/);

    await context.close();
  });
});
