import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('testuser1');

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyIsVisible();
  });

  test('Creation of a new NLP analysis task', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    const testText = 'Some test text for NLP analysis.';
    await dashboardPage.createJob(testText);

    await dashboardPage.verifyJobExistsInList(testText);
  });

  test('Getting a validation error for short text', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.createJob('short');

    await expect(page.locator('text=Text must be at least 10 characters long')).toBeVisible();
  });
});
