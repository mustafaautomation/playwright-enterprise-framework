import { CustomerInfo } from '../pages';

export function randomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function randomCustomerInfo(): CustomerInfo {
  return {
    firstName: randomString(6),
    lastName: randomString(8),
    postalCode: String(Math.floor(10000 + Math.random() * 90000)),
  };
}
