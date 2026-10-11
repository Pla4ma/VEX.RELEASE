import { normalizeError, isUserCancelled } from '../revenuecat-service-helpers';

it.each([null, undefined, 42, false, 'connection lost'])('normalizes arbitrary SDK failures: %p', (input: unknown) => {
  const error = normalizeError(input);
  expect(error).toBeInstanceOf(Error);
  expect(error.code).toBe('UNKNOWN');
  expect(error.underlyingError).toBeInstanceOf(Error);
  expect(isUserCancelled(input)).toBe(false);
});

it('keeps the original error identity for Sentry', () => {
  const original = new Error('Store unavailable');
  expect(normalizeError(original).underlyingError).toBe(original);
});
