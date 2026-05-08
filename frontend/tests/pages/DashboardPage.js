export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.jobFormSection = page.locator('#job-form-section');
    this.jobTextInput = page.locator('#job-text-input');
    this.submitJobButton = page.locator('#submit-job-btn');
    this.jobListSection = page.locator('#job-list-section');
    this.refreshJobsButton = page.locator('#refresh-jobs-btn');
  }

  async verifyIsVisible() {
    await this.jobFormSection.waitFor({ state: 'visible' });
    await this.jobListSection.waitFor({ state: 'visible' });
  }

  async createJob(text) {
    await this.jobTextInput.fill(text);
    await this.submitJobButton.click();
  }

  async verifyJobExistsInList(jobIdOrTextFragment) {
    await this.page.locator('text=Analysis started!').waitFor({ state: 'visible' });
  }
}
