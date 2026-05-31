/**
 * Companion Feature — Mood Tests
 *
 * Covers: calculateMood, getMoodMessage
 */

import { calculateMood, getMoodMessage } from '../companion-mood';
import type { CompanionMood } from '../types';

describe('calculateMood', () => {
  it('returns DANGER when purity < 30 and energy < 20', () => {
    expect(calculateMood(50, 10, 20)).toBe('DANGER');
  });

  it('returns STRUGGLING when energy < 30', () => {
    expect(calculateMood(50, 25, 80)).toBe('STRUGGLING');
  });

  it('returns ECSTATIC when progress > 95, energy > 80, purity > 90', () => {
    expect(calculateMood(96, 90, 95)).toBe('ECSTATIC');
  });

  it('returns DETERMINED when progress > 70 and energy > 60', () => {
    expect(calculateMood(80, 70, 60)).toBe('DETERMINED');
  });

  it('returns FOCUSED when progress > 30, energy > 50, purity > 70', () => {
    expect(calculateMood(50, 60, 80)).toBe('FOCUSED');
  });

  it('returns CONTENT when progress > 10 and energy > 30', () => {
    expect(calculateMood(20, 40, 50)).toBe('CONTENT');
  });

  it('returns SLEEPY as default for low progress and energy', () => {
    // energy=35 so it won't hit STRUGGLING (energy < 30)
    expect(calculateMood(5, 35, 50)).toBe('SLEEPY');
  });

  it('prioritizes DANGER over STRUGGLING when both conditions met', () => {
    expect(calculateMood(50, 15, 25)).toBe('DANGER');
  });
});

describe('getMoodMessage', () => {
  it('returns a string for every mood', () => {
    const moods: CompanionMood[] = [
      'SLEEPY', 'CONTENT', 'FOCUSED', 'DETERMINED', 'ECSTATIC', 'STRUGGLING', 'DANGER',
    ];
    for (const mood of moods) {
      expect(typeof getMoodMessage(mood)).toBe('string');
      expect(getMoodMessage(mood).length).toBeGreaterThan(0);
    }
  });

  it('returns specific messages for known moods', () => {
    expect(getMoodMessage('SLEEPY')).toContain('stirs');
    expect(getMoodMessage('ECSTATIC')).toContain('energy');
    expect(getMoodMessage('DANGER')).toContain('fading');
  });
});
