/**
 * Simple Jest Setup (without MSW)
 *
 * For tests that don't need API mocking
 */

import "@testing-library/jest-native/extend-expect";

// Global test flag
declare global {
  var __TEST__: boolean;
}

global.__TEST__ = true;

// Suppress specific console warnings during tests
const testConsole = globalThis.console;
const originalConsoleError = testConsole.error;
const originalConsoleWarn = testConsole.warn;

testConsole.error = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    /Warning.*not wrapped in act/.test(args[0])
  ) {
    return;
  }
  if (
    typeof args[0] === "string" &&
    /Native module cannot be null/.test(args[0])
  ) {
    return;
  }
  originalConsoleError.call(testConsole, ...args);
};

testConsole.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && /has been renamed/.test(args[0])) {
    return;
  }
  originalConsoleWarn.call(testConsole, ...args);
};

// Cleanup after tests
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
