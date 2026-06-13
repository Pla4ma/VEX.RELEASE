import { CircuitBreaker, CircuitState } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  it('starts in CLOSED state', () => {
    const cb = new CircuitBreaker();
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('allows execution when CLOSED', () => {
    const cb = new CircuitBreaker();
    expect(cb.canExecute()).toBe(true);
  });

  it('transitions to OPEN after threshold failures', () => {
    const cb = new CircuitBreaker(3, 30000);
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.CLOSED);
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.OPEN);
  });

  it('blocks execution when OPEN', () => {
    const cb = new CircuitBreaker(1, 30000);
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.OPEN);
    expect(cb.canExecute()).toBe(false);
  });

  it('transitions to HALF_OPEN after reset timeout', () => {
    const cb = new CircuitBreaker(1, 0);
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.OPEN);
    expect(cb.canExecute()).toBe(true); // timeout = 0, immediately half-open
    expect(cb.getState()).toBe(CircuitState.HALF_OPEN);
  });

  it('transitions to CLOSED on success', () => {
    const cb = new CircuitBreaker(); // default threshold = 5
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  it('uses custom threshold and timeout', () => {
    const cb = new CircuitBreaker(2, 5000);
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.CLOSED);
    cb.recordFailure();
    expect(cb.getState()).toBe(CircuitState.OPEN);
    expect(cb.canExecute()).toBe(false);
  });
});

describe('CircuitState enum', () => {
  it('has correct values', () => {
    expect(CircuitState.CLOSED).toBe('CLOSED');
    expect(CircuitState.OPEN).toBe('OPEN');
    expect(CircuitState.HALF_OPEN).toBe('HALF_OPEN');
  });
});
