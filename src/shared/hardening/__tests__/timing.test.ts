import { withTimeout, debounce, throttle } from '../timing';

describe('timing', () => {
  describe('withTimeout', () => {
    it('resolves when promise completes before timeout', async () => {
      const result = await withTimeout(Promise.resolve(42), 1000);
      expect(result).toBe(42);
    });

    it('rejects when promise exceeds timeout', async () => {
      await expect(
        withTimeout(new Promise((r) => setTimeout(() => r(42), 200)), 50),
      ).rejects.toThrow('Operation timed out');
    });

    it('uses custom error message', async () => {
      await expect(
        withTimeout(new Promise((r) => setTimeout(() => r(42), 200)), 50, 'Custom timeout'),
      ).rejects.toThrow('Custom timeout');
    });

    it('resolves immediately for already-resolved promise', async () => {
      const result = await withTimeout(Promise.resolve('done'), 1000);
      expect(result).toBe('done');
    });
  });

  describe('debounce', () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    it('delays execution until after delay', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced('arg');
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('arg');
    });

    it('resets timer on subsequent calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced('first');
      jest.advanceTimersByTime(50);
      debounced('second');
      jest.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledWith('second');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('only calls once for rapid successive calls', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => { jest.useFakeTimers(); });
    afterEach(() => { jest.useRealTimers(); });

    it('executes immediately on first call', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled('arg');
      expect(fn).toHaveBeenCalledWith('arg');
    });

    it('ignores calls during throttle window', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled('first');
      throttled('second');
      throttled('third');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('first');
    });

    it('allows call after throttle window expires', () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);
      throttled('first');
      jest.advanceTimersByTime(100);
      throttled('second');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('second');
    });
  });
});
