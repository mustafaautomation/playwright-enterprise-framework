import * as dotenv from 'dotenv';

const envFile = process.env.TEST_ENV === 'staging' ? '.env.staging' : '.env';
dotenv.config({ path: envFile });

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://www.saucedemo.com',
  STANDARD_USER: process.env.STANDARD_USER || 'standard_user',
  LOCKED_USER: process.env.LOCKED_USER || 'locked_out_user',
  PROBLEM_USER: process.env.PROBLEM_USER || 'problem_user',
  PERF_USER: process.env.PERF_USER || 'performance_glitch_user',
  // secret_sauce is SauceDemo's public credential (displayed on login page)
  PASSWORD: process.env.PASSWORD?.trim() || 'secret_sauce',
  TEST_ENV: process.env.TEST_ENV || 'production',
} as const;
