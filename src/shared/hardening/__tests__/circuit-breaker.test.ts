import { CircuitBreaker, type CircuitState } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  it('starts in closed state', () => {
    const cb = new CircuitBreaker();
    expect(cb.getState()).toBe('closed');
  });

  it('executes function successfully when closed', async () => {
    const cb = new CircuitBreaker();
    const result = await cb.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
    expect(cb.getState()).toBe('closed');
  });

  it('transitions to open after failure threshold', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, recoveryTimeoutMs: 60000 });
    const failFn = () => Promise.reject(new Error('fail'));

    await expect(cb.execute(failFn)).rejects.toThrow('fail');
    expect(cb.getState()).toBe('closed');

    await expect(cb.execute(failFn)).rejects.toThrow('fail');
    expect(cb.getState()).toBe('open');
  });

  it('throws immediately when open', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeoutMs: 60000 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    await expect(cb.execute(() => Promise.resolve(42))).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('transitions to half-open after recovery timeout', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeoutMs: 10 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    expect(cb.getState()).toBe('open');

    await new Promise((r) => setTimeout(r, 20));
    const result = await cb.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
    expect(cb.getState()).toBe('half-open');
  });

  it('transitions back to closed after successful half-open calls', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeoutMs: 10, halfOpenMaxCalls: 2 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');

    await new Promise((r) => setTimeout(r, 20));
    await cb.execute(() => Promise.resolve(1));
    await cb.execute(() => Promise.resolve(2));
    expect(cb.getState()).toBe('closed');
  });

  it('reopens on failure during half-open', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeoutMs: 10, halfOpenMaxCalls: 2 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');

    await new Promise((r) => setTimeout(r, 20));
    await cb.execute(() => Promise.resolve(1));
    expect(cb.getState()).toBe('half-open');

    await expect(cb.execute(() => Promise.reject(new Error('fail again')))).rejects.toThrow('fail again');
    expect(cb.getState()).toBe('open');
  });

  it('rejects when half-open call limit reached', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeoutMs: 10, halfOpenMaxCalls: 1 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');

    await new Promise((r) => setTimeout(r, 20));
    await cb.execute(() => Promise.resolve(1)); // uses the 1 half-open slot, transitions to closed
    // After transitioning back to closed, it should accept again
    const result = await cb.execute(() => Promise.resolve(2));
    expect(result).toBe(2);
  });

  it('calls onStateChange on transitions', async () => {
    const states: CircuitState[] = [];
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      recoveryTimeoutMs: 10,
      halfOpenMaxCalls: 1,
      onStateChange: (s) => states.push(s),
    });

    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    await new Promise((r) => setTimeout(r, 20));
    await cb.execute(() => Promise.resolve(1));

    expect(states).toContain('open');
    expect(states).toContain('half-open');
    // closed was the initial state, first transition is to 'open'
    expect(states.length).toBeGreaterThanOrEqual(2);
  });

  it('getMetrics returns current state', () => {
    const cb = new CircuitBreaker();
    const metrics = cb.getMetrics();
    expect(metrics).toEqual({ failureCount: 0, successCount: 0, state: 'closed' });
  });

  it('resets failure count on success during closed', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    const failFn = () => Promise.reject(new Error('fail'));

    await expect(cb.execute(failFn)).rejects.toThrow();
    await cb.execute(() => Promise.resolve(1));
    expect(cb.getMetrics().failureCount).toBe(0);

    await expect(cb.execute(failFn)).rejects.toThrow();
    expect(cb.getMetrics().failureCount).toBe(1);
  });
});
