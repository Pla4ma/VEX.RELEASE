/**
 * @sentry/react-native shim for Expo Go
 *
 * The real @sentry/react-native SDK accesses native TurboModules
 * (PlatformConstants, etc.) synchronously when the module is evaluated.
 * In Expo Go this crashes the app before the native runtime is ready.
 *
 * This shim provides no-op versions of every Sentry API so app code
 * continues to compile and run without any runtime errors.
 * Sentry error reporting simply won't work in Expo Go — which is fine
 * since Expo Go is only used for local development previews.
 */

'use strict';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Production build cannot use the Sentry shim.');
}

const noop = () => {};
const noopAsync = async () => {};

const fakeBreadcrumb = { message: '', category: '', level: 'info', data: {} };

const Sentry = {
  // Init
  init: noop,
  close: noopAsync,

  // Error capture
  captureException: noop,
  captureMessage: noop,
  captureEvent: noop,

  // Context
  setUser: noop,
  setTag: noop,
  setTags: noop,
  setExtra: noop,
  setExtras: noop,
  setContext: noop,
  configureScope: noop,
  withScope: (callback) => { try { callback({ setTag: noop, setExtra: noop, setContext: noop, setUser: noop, setLevel: noop }); } catch (_) {} },

  // Breadcrumbs
  addBreadcrumb: noop,

  // Performance
  startTransaction: () => ({
    finish: noop,
    setStatus: noop,
    setTag: noop,
    startChild: () => ({ finish: noop, setStatus: noop }),
  }),
  getCurrentHub: () => ({
    getScope: () => ({ setTransactionName: noop }),
    getClient: () => null,
    captureException: noop,
    captureMessage: noop,
    addBreadcrumb: noop,
  }),

  // Integrations
  reactNativeTracingIntegration: () => ({}),
  mobileReplayIntegration: () => ({}),
  feedbackIntegration: () => ({}),
  reactNavigationIntegration: () => ({ registerNavigationContainer: noop }),
  browserTracingIntegration: () => ({}),

  // Misc
  wrap: (fn) => fn,
  withSentryRouting: (component) => component,
  ErrorBoundary: ({ children }) => children,

  // Severity levels
  SeverityLevel: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Log: 'log',
    Info: 'info',
    Debug: 'debug',
  },
};

// Named exports that code may import directly
export { Sentry as default, Sentry };

// Re-export commonly destructured items
export const init = noop;
export const captureException = noop;
export const captureMessage = noop;
export const addBreadcrumb = noop;
export const setUser = noop;
export const setTag = noop;
export const setExtra = noop;
export const setContext = noop;
export const withScope = Sentry.withScope;
export const configureScope = noop;
export const startTransaction = Sentry.startTransaction;
export const getCurrentHub = Sentry.getCurrentHub;
export const reactNativeTracingIntegration = Sentry.reactNativeTracingIntegration;
export const mobileReplayIntegration = Sentry.mobileReplayIntegration;
export const feedbackIntegration = Sentry.feedbackIntegration;
export const reactNavigationIntegration = Sentry.reactNavigationIntegration;
export const ErrorBoundary = Sentry.ErrorBoundary;
