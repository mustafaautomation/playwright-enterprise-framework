import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async goto() {
    await this.navigate('/inventory.html');
  }

  /** The product list renders client-side; wait for it before reading a snapshot of it. */
  private async waitForProducts(): Promise<void> {
    await this.page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  }

  async getProductCount(): Promise<number> {
    await this.waitForProducts();
    return this.page.locator('.inventory_item').count();
  }

  async getProductNames(): Promise<string[]> {
    await this.waitForProducts();
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    await this.waitForProducts();
    const prices = await this.page.locator('.inventory_item_price').allTextContents();
    return prices.map((p) => parseFloat(p.replace('$', '')));
  }

  async addToCartByName(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item').filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await item.locator('[data-test^="add-to-cart"]').click();
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item').filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName }),
    });
    await item.locator('[data-test^="remove"]').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async openProduct(productName: string): Promise<void> {
    await this.page.locator('.inventory_item_name', { hasText: productName }).click();
    await this.page.waitForURL(/inventory-item\.html/);
  }
}
