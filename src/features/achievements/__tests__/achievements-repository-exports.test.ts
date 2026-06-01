import { describe, it, expect } from '@jest/globals';

jest.mock('../repository');

import * as repository from '../repository';

describe('Repository exports', () => {
  it('exports getUserAchievement', () => {
    expect(typeof repository.getUserAchievement).toBe('function');
  });

  it('exports getAllUserAchievements', () => {
    expect(typeof repository.getAllUserAchievements).toBe('function');
  });

  it('exports createUserAchievement', () => {
    expect(typeof repository.createUserAchievement).toBe('function');
  });

  it('exports updateAchievementProgress', () => {
    expect(typeof repository.updateAchievementProgress).toBe('function');
  });

  it('exports resetAllUserAchievements', () => {
    expect(typeof repository.resetAllUserAchievements).toBe('function');
  });
});
