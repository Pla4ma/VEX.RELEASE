/**
 * Jest Setup
 * 
 * Configuration for Jest testing environment.
 */

import '@testing-library/jest-native/extend-expect';

// Setup global test utilities
global.__TEST__ = true;

// Silence console warnings during tests (optional)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  if (/Warning.*has been renamed/.test(args[0])) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};
