import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async goto() {
    await this.navigate('/cart.html');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.page.locator('.cart_item .inventory_item_name').allTextContents();
  }

  async getCartItemPrices(): Promise<number[]> {
    const prices = await this.page.locator('.cart_item .inventory_item_price').allTextContents();
    return prices.map((p) => parseFloat(p.replace('$', '')));
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.cartItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await item.locator('[data-test^="remove"]').click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
