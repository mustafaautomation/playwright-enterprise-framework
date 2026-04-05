import { Page, Locator } from '@playwright/test';

export class Header {
  readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly burgerMenuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly resetAppStateLink: Locator;
  private readonly closeMenuButton: Locator;

  constructor(private readonly page: Page) {
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetAppStateLink = page.locator('#reset_sidebar_link');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
  }

  async getCartCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    return parseInt((await this.cartBadge.textContent()) ?? '0', 10);
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openMenu(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
    if (await this.closeMenuButton.isVisible()) {
      await this.closeMenuButton.click();
    }
  }
}
