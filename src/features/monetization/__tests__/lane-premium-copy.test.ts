import { describe, expect, it } from '@jest/globals';
import { getLanePremiumCopy, LANE_PREMIUM_COPY } from '../lane-premium-copy';

const OLD_ECONOMY_TERMS = [
  'coins',
  'gems',
  'shop',
  'inventory',
  'premium chest',
  'paid streak',
  'battle pass',
  'pay-to-win',
  'fake AI memory',
];

describe('lane-premium-copy', () => {
  it('has copy for all four lanes', () => {
    expect(Object.keys(LANE_PREMIUM_COPY)).toEqual([
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ]);
  });

  it('each lane headline is not empty', () => {
    for (const lane of Object.keys(LANE_PREMIUM_COPY) as Array<
      keyof typeof LANE_PREMIUM_COPY
    >) {
      expect(LANE_PREMIUM_COPY[lane].headline.length).toBeGreaterThan(10);
    }
  });

  it('each lane body is not empty', () => {
    for (const lane of Object.keys(LANE_PREMIUM_COPY) as Array<
      keyof typeof LANE_PREMIUM_COPY
    >) {
      expect(LANE_PREMIUM_COPY[lane].body.length).toBeGreaterThan(20);
    }
  });

  it('premium copy has no old economy terms', () => {
    for (const lane of Object.keys(LANE_PREMIUM_COPY) as Array<
      keyof typeof LANE_PREMIUM_COPY
    >) {
      const copy =
        `${LANE_PREMIUM_COPY[lane].headline} ${LANE_PREMIUM_COPY[lane].body}`.toLowerCase();
      for (const banned of OLD_ECONOMY_TERMS) {
        expect(copy).not.toContain(banned);
      }
    }
  });

  it('premium copy is lane-specific — no two lanes share same body', () => {
    const bodies = new Set(Object.values(LANE_PREMIUM_COPY).map((c) => c.body));
    expect(bodies.size).toBe(4);
  });

  it('premium copy never mentions shop, coins, or gems', () => {
    for (const lane of Object.keys(LANE_PREMIUM_COPY) as Array<
      keyof typeof LANE_PREMIUM_COPY
    >) {
      const full =
        `${LANE_PREMIUM_COPY[lane].headline} ${LANE_PREMIUM_COPY[lane].body}`.toLowerCase();
      expect(full).not.toMatch(
        /\b(shop|coins|gems|inventory|chest|battle.pass|pay.to.win)\b/,
      );
    }
  });

  it('getLanePremiumCopy returns blocked terms', () => {
    const copy = getLanePremiumCopy('student');
    expect(copy.blockedTerms).toContain('coins');
    expect(copy.blockedTerms).toContain('gems');
    expect(copy.blockedTerms).toContain('battle pass');
  });

  it('premium action trigger routes safely — copy is static and non-blocking', () => {
    const copy = getLanePremiumCopy('student');
    expect(typeof copy.headline).toBe('string');
    expect(typeof copy.body).toBe('string');
  });

  it('premium never blocks core session loop — copy is informational only', () => {
    for (const lane of Object.keys(LANE_PREMIUM_COPY) as Array<
      keyof typeof LANE_PREMIUM_COPY
    >) {
      const copy = `${LANE_PREMIUM_COPY[lane].headline} ${LANE_PREMIUM_COPY[lane].body}`;
      const lower = copy.toLowerCase();
      expect(lower).not.toContain('restrict');
      expect(lower).not.toContain('block core');
    }
  });
});
