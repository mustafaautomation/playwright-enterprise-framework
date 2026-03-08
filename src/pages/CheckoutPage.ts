import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage extends BasePage {
  // Step One
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step Two
  private readonly finishButton: Locator;
  private readonly summarySubtotal: Locator;
  private readonly summaryTax: Locator;
  private readonly summaryTotal: Locator;

  // Complete
  readonly completeHeader: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.summarySubtotal = page.locator('[data-test="subtotal-label"]');
    this.summaryTax = page.locator('[data-test="tax-label"]');
    this.summaryTotal = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async fillCustomerInfo(info: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async getSubtotal(): Promise<number> {
    const text = await this.summarySubtotal.textContent();
    return parseFloat(text?.replace(/[^0-9.]/g, '') ?? '0');
  }

  async getTax(): Promise<number> {
    const text = await this.summaryTax.textContent();
    return parseFloat(text?.replace(/[^0-9.]/g, '') ?? '0');
  }

  async getTotal(): Promise<number> {
    const text = await this.summaryTotal.textContent();
    return parseFloat(text?.replace(/[^0-9.]/g, '') ?? '0');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async getCompleteHeader(): Promise<string> {
    return (await this.completeHeader.textContent()) ?? '';
  }

  async backToProducts(): Promise<void> {
    await this.backHomeButton.click();
  }
}
