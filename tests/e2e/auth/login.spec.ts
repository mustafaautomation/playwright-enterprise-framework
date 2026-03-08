import { test, expect } from '../../../src/fixtures';
import { USERS } from '../../../src/data/users';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials @smoke @regression', async ({
    loginPage,
    page,
  }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should show error for invalid credentials @regression', async ({ loginPage }) => {
    await loginPage.login(USERS.invalid.username, USERS.invalid.password);
    await expect(loginPage.errorContainer).toBeVisible();
    await expect(loginPage.errorContainer).toContainText('Username and password do not match');
  });

  test('should show error for locked out user @regression', async ({ loginPage }) => {
    await loginPage.login(USERS.locked.username, USERS.locked.password);
    await expect(loginPage.errorContainer).toBeVisible();
    await expect(loginPage.errorContainer).toContainText('locked out');
  });

  test('should show error when username is empty @regression', async ({ loginPage }) => {
    await loginPage.login('', USERS.standard.password);
    await expect(loginPage.errorContainer).toBeVisible();
    await expect(loginPage.errorContainer).toContainText('Username is required');
  });

  test('should show error when password is empty @regression', async ({ loginPage }) => {
    await loginPage.login(USERS.standard.username, '');
    await expect(loginPage.errorContainer).toBeVisible();
    await expect(loginPage.errorContainer).toContainText('Password is required');
  });

  test('should logout successfully @smoke @regression', async ({ loginPage, header, page }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/inventory\.html/);
    await header.logout();
    await expect(page).toHaveURL('/');
  });
});
