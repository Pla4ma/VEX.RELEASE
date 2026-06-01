import { describe, it, expect } from '@jest/globals';
import { achievementKeys } from '../hooks';

describe('achievementKeys', () => {
  it("all key starts with 'achievements'", () => {
    expect(achievementKeys.all).toEqual(['achievements']);
  });

  it('byUser includes userId', () => {
    const key = achievementKeys.byUser('user-123');
    expect(key).toContain('user-123');
    expect(key[0]).toBe('achievements');
  });

  it("list includes userId and 'list'", () => {
    const key = achievementKeys.list('abc');
    expect(key).toContain('list');
    expect(key).toContain('abc');
  });

  it('detail includes userId and achievementId', () => {
    const key = achievementKeys.detail('u-1', 'ach-1');
    expect(key).toContain('detail');
    expect(key).toContain('u-1');
    expect(key).toContain('ach-1');
  });

  it("recent includes userId and 'recent'", () => {
    const key = achievementKeys.recent('u-1');
    expect(key).toContain('recent');
  });

  it("stats includes userId and 'stats'", () => {
    const key = achievementKeys.stats('u-1');
    expect(key).toContain('stats');
  });
});
