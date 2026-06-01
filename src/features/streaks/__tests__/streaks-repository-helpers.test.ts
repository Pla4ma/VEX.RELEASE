/**
 * Streaks Comprehensive Tests — Repository Helpers
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from '@jest/globals';

import { RepositoryError } from '../repository-helpers';

describe('RepositoryError', () => {
  it('constructs with operation and original error', () => {
    const err = new RepositoryError('fetchStreak', new Error('DB down'));
    expect(err.name).toBe('RepositoryError');
    expect(err.operation).toBe('fetchStreak');
    expect(err.message).toContain('fetchStreak');
    expect(err.message).toContain('DB down');
  });

  it('handles non-Error original', () => {
    const err = new RepositoryError('test', 'string error');
    expect(err.message).toContain('Unknown error');
  });
});

