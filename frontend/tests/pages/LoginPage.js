export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#login-username');
    this.submitButton = page.locator('#login-submit-btn');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async login(username) {
    await this.usernameInput.fill(username);
    await this.submitButton.click();
  }
}
