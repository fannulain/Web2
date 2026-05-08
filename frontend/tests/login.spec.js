import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('User Login Flow', () => {
  test('Successful authentication and redirection to the dashboard page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login('testuser1');
    await dashboardPage.verifyIsVisible();
    await expect(page.locator('text=Welcome, testuser1!')).toBeVisible();
  });

  test('Empty username shows validation error and stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.submitButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).not.toBeEmpty();
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});
