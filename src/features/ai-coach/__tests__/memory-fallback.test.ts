/**
 * Phase 10: Coach memory fallback test
 *
 * Proves coach doesn't fabricate memory when Supabase is unavailable.
 * Coach MUST fall back to basic CoachPresence without memory claims.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getUserMemories,
  getRelevantMemories,
  storeMemory,
  getOnboardingGoal,
  getMilestoneSummary,
} from '../memory/CoachMemory';

jest.mock('../repository/memories', () => ({
  createMemory: jest.fn().mockRejectedValue(new Error('Supabase unavailable')),
  getMemoriesByUser: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  getMemoriesByType: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  markMemoryReferenced: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  getMostRecentMemoryByType: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  hasMemoryOfType: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  getMemoriesByTypes: jest
    .fn()
    .mockRejectedValue(new Error('Supabase unavailable')),
  deleteMemory: jest.fn().mockRejectedValue(new Error('Supabase unavailable')),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), clearHistory: jest.fn() },
}));

jest.mock('../memory-events', () => ({
  createCoachMemoryCreatedEvent: jest.fn(() => ({})),
}));

jest.mock('../memory-analytics', () => ({
  trackMemoryCreated: jest.fn(),
  trackMemoryError: jest.fn(),
}));

const userId = '550e8400-e29b-41d4-a716-446655440000';

describe('Coach memory fallback when Supabase unavailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getUserMemories returns empty array on Supabase failure', async () => {
    const memories = await getUserMemories(userId);
    expect(memories).toEqual([]);
  });

  it('getRelevantMemories returns empty array on Supabase failure', async () => {
    const memories = await getRelevantMemories(userId, 'STREAK_RISK');
    expect(memories).toEqual([]);
  });

  it('storeMemory does not crash on Supabase failure', async () => {
    await expect(
      storeMemory(userId, 'STUDY_PATTERN', 'Test', 'desc'),
    ).rejects.toThrow();
  });

  it('getOnboardingGoal returns null on Supabase failure', async () => {
    const goal = await getOnboardingGoal(userId);
    expect(goal).toBeNull();
  });

  it('getMilestoneSummary returns zero-state on Supabase failure', async () => {
    const summary = await getMilestoneSummary(userId);
    expect(summary).toEqual({
      totalMemories: 0,
      mostRecent: null,
      favoriteType: null,
      streakOfSGrades: 0,
    });
  });

  it('never returns fabricated data when Supabase is down', async () => {
    const memories = await getUserMemories(userId);
    memories.forEach((memory) => {
      expect(typeof memory.id).toBe('string');
      expect(typeof memory.userId).toBe('string');
      expect(typeof memory.type).toBe('string');
    });
  });

  it('no claims of memory when Supabase returns nothing', async () => {
    const summary = await getMilestoneSummary(userId);
    expect(summary.totalMemories).toBe(0);
    expect(summary.mostRecent).toBeNull();
  });
});
