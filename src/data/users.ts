import { ENV } from '../../config/env';

export const USERS = {
  standard: {
    username: ENV.STANDARD_USER,
    password: ENV.PASSWORD,
  },
  locked: {
    username: ENV.LOCKED_USER,
    password: ENV.PASSWORD,
  },
  problem: {
    username: ENV.PROBLEM_USER,
    password: ENV.PASSWORD,
  },
  performance: {
    username: ENV.PERF_USER,
    password: ENV.PASSWORD,
  },
  invalid: {
    username: 'invalid_user',
    password: 'wrong_password',
  },
} as const;
