import { faker } from '@faker-js/faker';
import { CustomerInfo } from '../pages';

export function randomCustomerInfo(): CustomerInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
  };
}
