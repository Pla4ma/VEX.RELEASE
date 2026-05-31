/**
 * Tests for deriveRescueSurface from service.ts
 */

import { describe, it, expect } from '@jest/globals';

import { deriveRescueSurface } from '../service';
import { ModeRescueSurfaceSchema } from '../schemas';
import type { Lane } from '../../lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveRescueSurface
// ═══════════════════════════════════════════════════════════════════════

describe('deriveRescueSurface', () => {
  it('returns student rescue', () => {
    const rescue = deriveRescueSurface('student');
    expect(rescue.lane).toBe('student');
    expect(rescue.headline).toBe('Review one section for 8 minutes');
    expect(rescue.suggestedDurationMinutes).toBe(8);
    expect(rescue.actionLabel).toBe('Start review');
  });

  it('returns game_like rescue', () => {
    const rescue = deriveRescueSurface('game_like');
    expect(rescue.headline).toBe('Recovery run: 10 clean minutes');
    expect(rescue.suggestedDurationMinutes).toBe(10);
    expect(rescue.actionLabel).toBe('Start recovery run');
  });

  it('returns deep_creative rescue', () => {
    const rescue = deriveRescueSurface('deep_creative');
    expect(rescue.headline).toBe('Re-enter the project and find the next move');
    expect(rescue.suggestedDurationMinutes).toBe(7);
    expect(rescue.actionLabel).toBe('Re-enter project');
  });

  it('returns minimal_normal rescue with shortest duration', () => {
    const rescue = deriveRescueSurface('minimal_normal');
    expect(rescue.headline).toBe('Do 5 minutes. Stop cleanly.');
    expect(rescue.suggestedDurationMinutes).toBe(5);
    expect(rescue.actionLabel).toBe('Start');
  });

  it('falls back to minimal_normal for undefined input', () => {
    const rescue = deriveRescueSurface(undefined);
    expect(rescue.lane).toBe('minimal_normal');
  });

  it('returns valid ModeRescueSurface for all lanes', () => {
    for (const lane of ALL_LANES) {
      const rescue = deriveRescueSurface(lane);
      const result = ModeRescueSurfaceSchema.safeParse(rescue);
      expect(result.success).toBe(true);
    }
  });
});
