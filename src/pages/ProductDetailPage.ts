import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly productDescription: Locator;
  private readonly addToCartButton: Locator;
  private readonly removeButton: Locator;
  private readonly backButton: Locator;
  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.inventory_details_name');
    this.productPrice = page.locator('.inventory_details_price');
    this.productDescription = page.locator('.inventory_details_desc');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.removeButton = page.locator('[data-test^="remove"]');
    this.backButton = page.locator('[data-test="back-to-products"]');
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) ?? '';
  }

  async getProductPrice(): Promise<number> {
    const text = (await this.productPrice.textContent()) ?? '';
    return parseFloat(text.replace('$', ''));
  }

  async getProductDescription(): Promise<string> {
    return (await this.productDescription.textContent()) ?? '';
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  async isAddToCartVisible(): Promise<boolean> {
    return this.addToCartButton.isVisible();
  }

  async isRemoveVisible(): Promise<boolean> {
    return this.removeButton.isVisible();
  }

  getProductImage(productName: string): Locator {
    return this.page.getByRole('img', { name: productName });
  }
}
