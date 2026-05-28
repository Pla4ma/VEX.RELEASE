/**
 * Console suppression and test lifecycle helpers
 *
 * Suppresses known noisy warnings/errors during tests (act() warnings,
 * native module null warnings, "has been renamed" deprecation notices).
 * Also provides beforeEach/afterEach cleanup and custom matchers.
 */

declare global {
  var __TEST__: boolean;
}

global.__TEST__ = true;

/** Suppress known noisy console.error messages in tests */
function setupConsoleSuppression(): void {
  const testConsole = globalThis.console;
  const originalConsoleError = testConsole.error;
  const originalConsoleWarn = testConsole.warn;

  testConsole.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      /Warning.*not wrapped in act|Native module cannot be null|TurboModuleRegistry\.getEnforcing/.test(
        args[0],
      )
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
}

setupConsoleSuppression();

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});

declare module "expect" {
  interface AsymmetricMatchers {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}
