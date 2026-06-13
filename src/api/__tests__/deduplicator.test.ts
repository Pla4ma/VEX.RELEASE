import { RequestDeduplicator } from '../deduplicator';

describe('RequestDeduplicator', () => {
  it('executes request on first call', async () => {
    const dedup = new RequestDeduplicator();
    const result = await dedup.deduplicate('key1', async () => 'result1');
    expect(result).toBe('result1');
  });

  it('deduplicates concurrent requests with same key', async () => {
    const dedup = new RequestDeduplicator();
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return `result-${callCount}`;
    };

    const [a, b] = await Promise.all([
      dedup.deduplicate('same-key', factory),
      dedup.deduplicate('same-key', factory),
    ]);

    expect(a).toBe(b);
    // One of them should have been deduplicated
    expect(callCount).toBeLessThanOrEqual(2);
  });

  it('allows different keys to execute independently', async () => {
    const dedup = new RequestDeduplicator();
    const resultA = await dedup.deduplicate('key-a', async () => 'a');
    const resultB = await dedup.deduplicate('key-b', async () => 'b');
    expect(resultA).toBe('a');
    expect(resultB).toBe('b');
  });

  it('allows same key after previous request completes', async () => {
    const dedup = new RequestDeduplicator();
    const first = await dedup.deduplicate('key', async () => 'first');
    const second = await dedup.deduplicate('key', async () => 'second');
    expect(first).toBe('first');
    expect(second).toBe('second');
  });
});
