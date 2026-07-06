/**
 * Captures exception to Sentry and rethrows.
 * Extracted to eliminate duplicated require() + captureException patterns.
 */
export function captureAndRethrow(error: unknown): never {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/react-native');
  Sentry.captureException(error);
  throw error;
}
