import { categorizeError, calculateRetryDelay } from '../ErrorBoundary.helpers';

describe('categorizeError', () => {
  it('categorizes network errors', () => {
    expect(categorizeError(new Error('Network connection failed'))).toBe('network');
    expect(categorizeError(new Error('Fetch request failed'))).toBe('network');
    expect(categorizeError(new Error('Request timeout'))).toBe('network');
  });

  it('categorizes auth errors', () => {
    expect(categorizeError(new Error('Authentication failed'))).toBe('auth');
    expect(categorizeError(new Error('Unauthorized access'))).toBe('auth');
    expect(categorizeError(new Error('Invalid token'))).toBe('auth');
  });

  it('categorizes validation errors', () => {
    expect(categorizeError(new Error('Validation failed'))).toBe('validation');
    expect(categorizeError(new Error('Invalid input'))).toBe('validation');
  });

  it('categorizes server errors', () => {
    expect(categorizeError(new Error('Server error occurred'))).toBe('server');
    expect(categorizeError(new Error('500 internal error'))).toBe('server');
    expect(categorizeError(new Error('503 service unavailable'))).toBe('server');
  });

  it('categorizes client errors by error name', () => {
    const err = new Error('Some error');
    err.name = 'CustomError';
    expect(categorizeError(err)).toBe('client');
  });

  it('returns unknown for unrecognized errors', () => {
    const err = new Error('Something weird happened');
    err.name = 'SomeWeirdThing';
    expect(categorizeError(err)).toBe('unknown');
  });

  it('is case-insensitive', () => {
    expect(categorizeError(new Error('NETWORK failure'))).toBe('network');
    expect(categorizeError(new Error('AUTH failure'))).toBe('auth');
  });

  it('excludes ReferenceError and TypeError from client', () => {
    const refErr = new ReferenceError('ref');
    const typeErr = new TypeError('type');
    expect(categorizeError(refErr)).toBe('unknown');
    expect(categorizeError(typeErr)).toBe('unknown');
  });
});

describe('calculateRetryDelay', () => {
  it('returns base delay for attempt 0', () => {
    const delay = calculateRetryDelay(0, 1000);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(2000);
  });

  it('increases exponentially', () => {
    const delay0 = calculateRetryDelay(0, 1000);
    const delay1 = calculateRetryDelay(1, 1000);
    expect(delay1).toBeGreaterThan(delay0);
  });

  it('caps at 30000ms', () => {
    const delay = calculateRetryDelay(10, 1000);
    expect(delay).toBeLessThanOrEqual(30000);
  });

  it('includes jitter (produces varied results)', () => {
    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(calculateRetryDelay(1, 1000));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
