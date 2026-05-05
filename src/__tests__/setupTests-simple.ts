/**
 * Simple Jest Setup (without MSW)
 *
 * For tests that don't need API mocking
 */

import '@testing-library/jest-native/extend-expect';

// Global test flag
declare global {
  var __TEST__: boolean;
}

global.__TEST__ = true;

// Suppress specific console warnings during tests
const originalConsoleError = globalThis['console'].error;
const originalConsoleWarn = globalThis['console'].warn;

globalThis['console'].error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && /Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  if (typeof args[0] === 'string' && /Native module cannot be null/.test(args[0])) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

globalThis['console'].warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && /has been renamed/.test(args[0])) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
