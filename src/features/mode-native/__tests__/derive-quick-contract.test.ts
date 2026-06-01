/**
 * Tests for deriveQuickContract from service.ts
 */

import { describe, it, expect } from '@jest/globals';

import { deriveQuickContract } from '../service';
import { ModeQuickContractSchema } from '../schemas';
import type { Lane } from '../../lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveQuickContract
// ═══════════════════════════════════════════════════════════════════════

describe('deriveQuickContract', () => {
  it('returns student contract when lane is student', () => {
    const contract = deriveQuickContract('student');
    expect(contract.lane).toBe('student');
    expect(contract.title).toBe('Quick contract: Study');
    expect(contract.questions).toHaveLength(2);
    expect(contract.questions[0].key).toBe('topic');
    expect(contract.suggestedDurationMinutes).toBe(20);
    expect(contract.startLabel).toBe('Start study block');
  });

  it('returns game_like contract', () => {
    const contract = deriveQuickContract('game_like');
    expect(contract.lane).toBe('game_like');
    expect(contract.title).toBe('Quick contract: Run');
    expect(contract.startLabel).toBe('Start run');
  });

  it('returns deep_creative contract', () => {
    const contract = deriveQuickContract('deep_creative');
    expect(contract.lane).toBe('deep_creative');
    expect(contract.title).toBe('Quick contract: Project');
    expect(contract.startLabel).toBe('Start project block');
  });

  it('returns minimal_normal contract with 1 question', () => {
    const contract = deriveQuickContract('minimal_normal');
    expect(contract.lane).toBe('minimal_normal');
    expect(contract.title).toBe('Quick contract: Clean');
    expect(contract.questions).toHaveLength(1);
    expect(contract.questions[0].key).toBe('action');
    expect(contract.suggestedDurationMinutes).toBe(15);
  });

  it('falls back to minimal_normal for null lane', () => {
    const contract = deriveQuickContract(null);
    expect(contract.lane).toBe('minimal_normal');
  });

  it('falls back to minimal_normal for undefined lane', () => {
    const contract = deriveQuickContract(undefined);
    expect(contract.lane).toBe('minimal_normal');
  });

  it('falls back to minimal_normal for invalid lane', () => {
    const contract = deriveQuickContract('invalid' as unknown as Lane);
    expect(contract.lane).toBe('minimal_normal');
  });

  it('returns valid ModeQuickContract for all lanes', () => {
    for (const lane of ALL_LANES) {
      const contract = deriveQuickContract(lane);
      const result = ModeQuickContractSchema.safeParse(contract);
      expect(result.success).toBe(true);
    }
  });
});
