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
});
