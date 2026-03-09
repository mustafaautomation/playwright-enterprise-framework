import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string = '/') {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  async waitForPageLoad(state: 'load' | 'networkidle' | 'domcontentloaded' = 'load') {
    await this.page.waitForLoadState(state);
  }

  async waitForElement(
    locator: Locator,
    options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' },
  ) {
    await locator.waitFor({ state: options?.state ?? 'visible', timeout: options?.timeout });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}
