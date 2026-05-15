import { expect as jestExpect } from '@jest/globals';

export const describe = global.describe;
export const it = global.it;
export const test = global.test;
export const expect = jestExpect;
export const beforeAll = global.beforeAll;
export const beforeEach = global.beforeEach;
export const afterEach = global.afterEach;
export const afterAll = global.afterAll;
export const vi = {
  ...jest,
  mocked: <T>(item: T): T => item,
};

export type MockedFunction<T extends (...args: never[]) => unknown> = jest.MockedFunction<T>;
