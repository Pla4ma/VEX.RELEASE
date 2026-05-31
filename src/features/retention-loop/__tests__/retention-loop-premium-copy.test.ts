import { describe, expect, it } from '@jest/globals';
import {
  getPremiumCopy,
  getPremiumHeadline,
  getRescueCopy,
  getNotificationCopy,
} from '../retention-guards';

const ALL_LANES = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;

describe('getPremiumCopy', () => {
  it('returns lane-specific copy for each lane', () => {
    for (const lane of ALL_LANES) {
      const copy = getPremiumCopy(lane);
      expect(copy.length).toBeGreaterThan(0);
    }
  });

  it('student copy mentions Study Intelligence', () => {
    expect(getPremiumCopy('student')).toContain('Study Intelligence');
  });

  it('game_like copy mentions Run Intelligence', () => {
    expect(getPremiumCopy('game_like')).toContain('Run Intelligence');
  });

  it('deep_creative copy mentions Project Memory', () => {
    expect(getPremiumCopy('deep_creative')).toContain('Project Memory');
  });

  it('minimal_normal copy mentions Focus Intelligence', () => {
    expect(getPremiumCopy('minimal_normal')).toContain('Focus Intelligence');
  });
});

describe('getPremiumHeadline', () => {
  it('returns headline for each lane', () => {
    for (const lane of ALL_LANES) {
      const headline = getPremiumHeadline(lane);
      expect(headline.length).toBeGreaterThan(0);
    }
  });

  it('returns distinct headlines per lane', () => {
    const headlines = ALL_LANES.map((l) => getPremiumHeadline(l));
    expect(new Set(headlines).size).toBe(ALL_LANES.length);
  });
});

describe('getRescueCopy', () => {
  it('returns headline, body, sessionMinutes, and actionLabel for each lane', () => {
    for (const lane of ALL_LANES) {
      const copy = getRescueCopy(lane);
      expect(copy.headline.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
      expect(copy.sessionMinutes).toBeGreaterThan(0);
      expect(copy.actionLabel.length).toBeGreaterThan(0);
    }
  });

  it('student rescue has 8 minutes', () => {
    expect(getRescueCopy('student').sessionMinutes).toBe(8);
  });

  it('game_like rescue has 10 minutes', () => {
    expect(getRescueCopy('game_like').sessionMinutes).toBe(10);
  });

  it('deep_creative rescue has 7 minutes', () => {
    expect(getRescueCopy('deep_creative').sessionMinutes).toBe(7);
  });

  it('minimal_normal rescue has 5 minutes', () => {
    expect(getRescueCopy('minimal_normal').sessionMinutes).toBe(5);
  });
});

describe('getNotificationCopy', () => {
  it('returns title and body for each lane', () => {
    for (const lane of ALL_LANES) {
      const copy = getNotificationCopy(lane);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
    }
  });

  it('returns distinct titles per lane', () => {
    const titles = ALL_LANES.map((l) => getNotificationCopy(l).title);
    expect(new Set(titles).size).toBe(ALL_LANES.length);
  });
});
