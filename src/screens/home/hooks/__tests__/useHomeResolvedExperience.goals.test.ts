import { resolvePrimaryGoal } from './useHomeResolvedExperience.helpers';

describe('useHomeResolvedExperience — goal mappings', () => {
  it('LEARNING goal maps to learning', () => {
    expect(resolvePrimaryGoal('LEARNING')).toBe('learning');
  });

  it('PERSONAL maps consistently to personal', () => {
    expect(resolvePrimaryGoal('PERSONAL')).toBe('personal');
  });

  it('STUDY maps to study', () => {
    expect(resolvePrimaryGoal('STUDY')).toBe('study');
  });

  it('WORK maps to work', () => {
    expect(resolvePrimaryGoal('WORK')).toBe('work');
  });

  it('CREATIVE maps to creative', () => {
    expect(resolvePrimaryGoal('CREATIVE')).toBe('creative');
  });

  it('unknown goal defaults to focus', () => {
    expect(resolvePrimaryGoal(null)).toBe('focus');
    expect(resolvePrimaryGoal('RANDOM')).toBe('focus');
  });
});
