import {
  buildDailyModifierSummary,
  getDailyBossDamageMultiplier,
  getDailyModifier,
  getDailyRewardMultiplier,
} from '../daily-modifiers';
import { SessionMode } from '../../../session/modes';

const wednesday = new Date('2026-04-29T12:00:00-04:00').getTime();
const tuesday = new Date('2026-04-28T12:00:00-04:00').getTime();
const saturday = new Date('2026-05-02T12:00:00-04:00').getTime();

describe('daily gameplay modifiers', () => {
  it('returns the deterministic modifier for the calendar day', () => {
    expect(getDailyModifier(wednesday).id).toBe('midweek-sprint');
  });

  it('only applies mode-specific XP bonuses when the session mode matches', () => {
    expect(getDailyRewardMultiplier({
      sessionMode: SessionMode.DEEP_WORK,
      timestamp: tuesday,
    })).toBe(1.5);
    expect(getDailyRewardMultiplier({
      sessionMode: SessionMode.LIGHT_FOCUS,
      timestamp: tuesday,
    })).toBe(1);
  });

  it('applies global boss damage days to every mode', () => {
    expect(getDailyBossDamageMultiplier({
      sessionMode: SessionMode.LIGHT_FOCUS,
      timestamp: saturday,
    })).toBe(1.5);
  });

  it('summarizes the active modifier for completion surfaces', () => {
    const summary = buildDailyModifierSummary({
      sessionMode: SessionMode.SPRINT,
      timestamp: wednesday,
    });

    expect(summary.isMatched).toBe(true);
    expect(summary.rewardMultiplier).toBe(1.2);
    expect(summary.bossDamageMultiplier).toBe(2);
  });
});
