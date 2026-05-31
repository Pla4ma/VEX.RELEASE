import { buildDefaultAuditScores } from '../service';

describe('mode-retention comprehensive', () => {
  describe('buildDefaultAuditScores', () => {
    it('returns 4 scores, one per lane', () => {
      const scores = buildDefaultAuditScores();
      expect(scores).toHaveLength(4);
      const lanes = scores.map((s) => s.lane);
      expect(lanes).toContain('student');
      expect(lanes).toContain('game_like');
      expect(lanes).toContain('deep_creative');
      expect(lanes).toContain('minimal_normal');
    });

    it('minimal_normal has lower memory relevance than other lanes', () => {
      const scores = buildDefaultAuditScores();
      const minimal = scores.find((s) => s.lane === 'minimal_normal')!;
      const others = scores.filter((s) => s.lane !== 'minimal_normal');
      for (const other of others) {
        expect(minimal.memoryRelevance).toBeLessThan(other.memoryRelevance);
      }
    });

    it('all default scores have totalScore > 0', () => {
      const scores = buildDefaultAuditScores();
      for (const score of scores) {
        expect(score.totalScore).toBeGreaterThan(0);
      }
    });
  });
});
