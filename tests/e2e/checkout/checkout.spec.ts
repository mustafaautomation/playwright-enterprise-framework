import { test, expect } from '../../../src/fixtures';
import { randomCustomerInfo } from '../../../src/utils/helpers';
import { PRODUCTS } from '../../../src/data/products';

test.describe('Checkout', () => {
  let customer: ReturnType<typeof randomCustomerInfo>;

  test.beforeEach(async ({ inventoryPage, cartPage, header, page }) => {
    customer = randomCustomerInfo();
    await inventoryPage.goto();
    await inventoryPage.addToCartByName('Sauce Labs Backpack');
    await inventoryPage.addToCartByName('Sauce Labs Bolt T-Shirt');
    await header.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('should complete full checkout flow end-to-end @smoke @regression', async ({
    checkoutPage,
    page,
  }) => {
    await test.step('Fill customer information', async () => {
      await checkoutPage.fillCustomerInfo(customer);
      await checkoutPage.continue();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('Complete order', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/checkout-complete\.html/);
    });

    await test.step('Verify confirmation', async () => {
      await expect(checkoutPage.completeHeader).toContainText('Thank you for your order');
    });
  });

  test('should calculate correct order total @regression', async ({ checkoutPage }) => {
    await test.step('Fill customer info and proceed', async () => {
      await checkoutPage.fillCustomerInfo(customer);
      await checkoutPage.continue();
    });

    await test.step('Verify order calculations', async () => {
      const subtotal = await checkoutPage.getSubtotal();
      const tax = await checkoutPage.getTax();
      const total = await checkoutPage.getTotal();

      const expectedSubtotal = PRODUCTS[0].price + PRODUCTS[2].price;
      expect(subtotal).toBeCloseTo(expectedSubtotal, 1);
      expect(total).toBeCloseTo(subtotal + tax, 1);
    });
  });

  test('should show error when first name is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo({ ...customer, firstName: '' });
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });

  test('should show error when last name is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo({ ...customer, lastName: '' });
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toContainText('Last Name is required');
  });

  test('should show error when postal code is missing @regression', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo({ ...customer, postalCode: '' });
    await checkoutPage.continue();
    await expect(checkoutPage.errorMessage).toContainText('Postal Code is required');
  });

  test('should return to products after completing order @regression', async ({
    checkoutPage,
    page,
  }) => {
    await checkoutPage.fillCustomerInfo(customer);
    await checkoutPage.continue();
    await checkoutPage.finish();
    await checkoutPage.backToProducts();
    await expect(page).toHaveURL(/inventory\.html/);
  });
});
