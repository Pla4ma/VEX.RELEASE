import {
  enforceDay0SurfacePolicy,
  DEFAULT_DAY0_POLICY,
  makeDay0Map,
  visibleCount,
} from './helpers';
import type { HomeSurfaceMap } from '../../surface-decision-schemas';

describe('Day 0 Surface Policy', () => {
  describe('enforceDay0SurfacePolicy validation', () => {
    function makeViolatingMap(): HomeSurfaceMap {
      return {
        start_session: 'primary',
        coach_presence: 'spotlight',
        progress_proof: 'secondary',
        focus_score: 'secondary',
        progress_detail: 'tiny_tease',
        study_layer: 'secondary',
        companion_thread: 'secondary',
        boss_teaser: 'tiny_tease',
        boss_compact: 'tiny_tease',
        boss_full_cta: 'tiny_tease',
        challenge_teaser: 'tiny_tease',
        unlock_strip: 'tiny_tease',
        premium_tease: 'tiny_tease',
        weekly_quest: 'secondary',
      };
    }

    it('corrects blocked surfaces to hidden', () => {
      const { violations, corrected } =
        enforceDay0SurfacePolicy(makeViolatingMap());
      expect(corrected.progress_proof).toBe('hidden');
      expect(corrected.focus_score).toBe('hidden');
      expect(corrected.challenge_teaser).toBe('hidden');
      expect(corrected.premium_tease).toBe('hidden');
      expect(violations.length).toBeGreaterThan(0);
    });

    it('ensures no more than maxVisibleSurfaces', () => {
      const { corrected } = enforceDay0SurfacePolicy(makeViolatingMap());
      const count = visibleCount(corrected);
      expect(count).toBeLessThanOrEqual(DEFAULT_DAY0_POLICY.maxVisibleSurfaces);
    });

    it('ensures exactly one primary CTA', () => {
      const map = makeViolatingMap();
      map.start_session = 'primary';
      const { corrected } = enforceDay0SurfacePolicy(map);
      const primaries = Object.entries(corrected).filter(
        ([, v]) => v === 'primary',
      );
      expect(primaries.length).toBeLessThanOrEqual(1);
    });

    it('does not modify a valid Day 0 map', () => {
      const map = makeDay0Map();
      const result = enforceDay0SurfacePolicy(map);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});
