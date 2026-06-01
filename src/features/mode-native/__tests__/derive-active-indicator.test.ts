/**
 * Tests for deriveActiveIndicator from service.ts
 */

import { describe, it, expect } from '@jest/globals';

import { deriveActiveIndicator } from '../service';
import { ModeActiveIndicatorSchema } from '../schemas';
import type { Lane } from '../../lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveActiveIndicator
// ═══════════════════════════════════════════════════════════════════════

describe('deriveActiveIndicator', () => {
  it('returns student indicator', () => {
    const indicator = deriveActiveIndicator('student');
    expect(indicator.lane).toBe('student');
    expect(indicator.targetLabel).toBe('Studying');
    expect(indicator.topLine).toBe('Stay focused on the material');
    expect(indicator.density).toBe('medium');
    expect(indicator.quiet).toBe(true);
  });

  it('returns game_like indicator', () => {
    const indicator = deriveActiveIndicator('game_like');
    expect(indicator.targetLabel).toBe('Momentum');
    expect(indicator.topLine).toBe('Clean start — keep moving forward');
  });

  it('returns deep_creative indicator', () => {
    const indicator = deriveActiveIndicator('deep_creative');
    expect(indicator.targetLabel).toBe('Protecting');
    expect(indicator.allowNotes).toBe(true);
  });

  it('returns minimal_normal indicator with low density', () => {
    const indicator = deriveActiveIndicator('minimal_normal');
    expect(indicator.targetLabel).toBe('One action');
    expect(indicator.density).toBe('low');
    expect(indicator.allowNotes).toBe(false);
  });

  it('falls back to minimal_normal for null input', () => {
    const indicator = deriveActiveIndicator(null);
    expect(indicator.lane).toBe('minimal_normal');
  });

  it('returns valid ModeActiveIndicator for all lanes', () => {
    for (const lane of ALL_LANES) {
      const indicator = deriveActiveIndicator(lane);
      const result = ModeActiveIndicatorSchema.safeParse(indicator);
      expect(result.success).toBe(true);
    }
  });
});
