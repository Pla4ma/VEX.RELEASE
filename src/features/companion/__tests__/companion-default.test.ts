/**
 * Companion Feature — Default Companion Tests
 *
 * Covers: createDefaultCompanion
 */

import { createDefaultCompanion } from '../companion-schemas';
import type { CompanionState } from '../types';

describe('createDefaultCompanion', () => {
  it('creates default companion with given userId', () => {
    const companion = createDefaultCompanion('user-123');
    expect(companion.id).toBe('companion_user-123');
    expect(companion.userId).toBe('user-123');
    expect(companion.phase).toBe('EGG');
    expect(companion.level).toBe(1);
    expect(companion.totalFocusMinutes).toBe(0);
    expect(companion.element).toBe('FLAME');
  });

  it('uses custom element when provided', () => {
    const companion = createDefaultCompanion('user-123', { element: 'WAVE' });
    expect(companion.element).toBe('WAVE');
    expect(companion.colorHue).toBe(170);
  });

  it('maps each element to correct hue', () => {
    const hueMap = { FLAME: 15, WAVE: 170, TERRA: 100, ZEPHYR: 200, VOID: 270, LUMINA: 45 };
    for (const [element, expectedHue] of Object.entries(hueMap)) {
      const companion = createDefaultCompanion('u', { element: element as CompanionState['element'] });
      expect(companion.colorHue).toBe(expectedHue);
    }
  });

  it('defaults to SLEEPY mood and 0 progress', () => {
    const companion = createDefaultCompanion('u');
    expect(companion.currentMood).toBe('SLEEPY');
    expect(companion.sessionProgress).toBe(0);
  });
});
