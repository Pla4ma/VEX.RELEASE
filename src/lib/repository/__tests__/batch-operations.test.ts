import { describe, expect, it, jest } from '@jest/globals';
import {
  withOptimisticLock,
  batchWithRetry,
  createRetryableQuery,
  type VersionedEntity,
} from '../batch-operations';
import { RepositoryError } from '../error-handling';

const mockSupabaseClient = { from: jest.fn() };
jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

jest.mock('../error-handling', () => {
  const actual = jest.requireActual('../error-handling') as Record<string, unknown>;
  return {
    ...actual,
    classifyError: jest.fn(() => 'SERVER_ERROR'),
  };
});

describe('withOptimisticLock', () => {
  it('succeeds when version matches', async () => {
    const entity: VersionedEntity = { id: '1', version: 3, updatedAt: 100 };
    const fetchFn = jest.fn<() => Promise<VersionedEntity | null>>().mockResolvedValue(entity);
    const updateFn = jest.fn<(e: VersionedEntity) => Promise<VersionedEntity>>()
      .mockResolvedValue({ ...entity, version: 4, updatedAt: 200 });
    const result = await withOptimisticLock('update', fetchFn, updateFn, 3);
    expect(result.version).toBe(4);
    expect(updateFn).toHaveBeenCalledWith(entity);
  });

  it('throws NOT_FOUND when entity is null', async () => {
    const fetchFn = jest.fn<() => Promise<VersionedEntity | null>>().mockResolvedValue(null);
    const updateFn = jest.fn();
    await expect(withOptimisticLock('update', fetchFn, updateFn, 1)).rejects.toThrow();
    expect(updateFn).not.toHaveBeenCalled();
  });

  it('throws CONFLICT when version mismatches', async () => {
    const entity: VersionedEntity = { id: '1', version: 5, updatedAt: 100 };
    const fetchFn = jest.fn<() => Promise<VersionedEntity | null>>().mockResolvedValue(entity);
    const updateFn = jest.fn();
    await expect(withOptimisticLock('update', fetchFn, updateFn, 3)).rejects.toThrow();
    expect(updateFn).not.toHaveBeenCalled();
  });
});

describe('batchWithRetry', () => {
  it('processes all items successfully', async () => {
    const items = [1, 2, 3];
    const fn = jest.fn<(item: number) => Promise<string>>()
      .mockImplementation(async (item) => `result-${item}`);
    const result = await batchWithRetry('batch', items, fn);
    expect(result.successful).toEqual(['result-1', 'result-2', 'result-3']);
    expect(result.failed).toHaveLength(0);
  });

  it('collects failed items when continueOnError is true', async () => {
    const items = [1, 2, 3];
    const fn = jest.fn<(item: number) => Promise<string>>()
      .mockImplementation(async (item) => {
        if (item === 2) throw new Error('fail');
        return `result-${item}`;
      });
    const result = await batchWithRetry('batch', items, fn, { continueOnError: true });
    expect(result.successful).toEqual(['result-1', 'result-3']);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]!.item).toBe(2);
    expect(result.failed[0]!.error).toBeInstanceOf(RepositoryError);
  });

  it('throws on first error when continueOnError is false', async () => {
    const items = [1, 2, 3];
    const fn = jest.fn<(item: number) => Promise<string>>()
      .mockImplementation(async (item) => {
        if (item === 2) throw new Error('fail');
        return `result-${item}`;
      });
    await expect(batchWithRetry('batch', items, fn, { continueOnError: false })).rejects.toThrow();
  });

  it('handles empty items array', async () => {
    const result = await batchWithRetry('batch', [], jest.fn());
    expect(result.successful).toEqual([]);
    expect(result.failed).toEqual([]);
  });

  it('wraps non-RepositoryError in RepositoryError', async () => {
    const fn = jest.fn<(item: number) => Promise<string>>()
      .mockRejectedValue('string error');
    const result = await batchWithRetry('batch', [1], fn, { continueOnError: true });
    expect(result.failed[0]!.error).toBeInstanceOf(RepositoryError);
  });
});

describe('createRetryableQuery', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('query returns data on success', async () => {
    const rq = createRetryableQuery();
    const result = await rq.query('fetchUser', async () => {
      return { data: { id: '1' } as { id: string } | null, error: null };
    });
    expect(result).toEqual({ id: '1' });
  });

  it('query throws on error', async () => {
    const rq = createRetryableQuery();
    await expect(rq.query('fetchUser', async () => {
      return { data: null as { id: string } | null, error: new Error('db error') };
    })).rejects.toThrow();
  });

  it('query throws NOT_FOUND when data is null', async () => {
    const rq = createRetryableQuery();
    await expect(rq.query('fetchUser', async () => {
      return { data: null as { id: string } | null, error: null };
    })).rejects.toThrow();
  });

  it('queryNullable returns data on success', async () => {
    const rq = createRetryableQuery();
    const result = await rq.queryNullable('fetchUser', async () => {
      return { data: { id: '1' } as { id: string } | null, error: null };
    });
    expect(result).toEqual({ id: '1' });
  });

  it('queryNullable throws on non-NOT_FOUND errors', async () => {
    const rq = createRetryableQuery();
    await expect(rq.queryNullable('fetchUser', async () => {
      return { data: null as { id: string } | null, error: new Error('server error') };
    })).rejects.toThrow();
  });
});
