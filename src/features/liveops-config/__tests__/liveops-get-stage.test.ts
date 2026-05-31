/**
 * Liveops Config Feature — getStage Tests
 */

import { getStage } from '../feature-access';

describe('getStage', () => {
  it('returns NEW_USER for 0 sessions', () => {
    expect(getStage(0)).toBe('NEW_USER');
  });

  it('returns ACTIVATING for 1-2 sessions', () => {
    expect(getStage(1)).toBe('ACTIVATING');
    expect(getStage(2)).toBe('ACTIVATING');
  });

  it('returns ENGAGED for 3-9 sessions', () => {
    expect(getStage(3)).toBe('ENGAGED');
    expect(getStage(9)).toBe('ENGAGED');
  });

  it('returns POWER_USER for 10+ sessions', () => {
    expect(getStage(10)).toBe('POWER_USER');
    expect(getStage(100)).toBe('POWER_USER');
  });
});
