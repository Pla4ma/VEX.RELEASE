/**
 * Mode-Native Comprehensive Tests — deriveWeeklyIntelligence
 *
 * Covers: deriveWeeklyIntelligence service function with all lane
 * enrichment paths, template filling, and schema validation.
 */

import { describe, it, expect } from '@jest/globals';

// ── Service-surface functions ─────────────────────────────────────────
import { deriveWeeklyIntelligence } from '../service-surface';

// ── Schemas ───────────────────────────────────────────────────────────
import { ModeWeeklyIntelligenceSchema } from '../schemas';

// ── Lane types ────────────────────────────────────────────────────────
import type { Lane } from '../../lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveWeeklyIntelligence
// ═══════════════════════════════════════════════════════════════════════

describe('deriveWeeklyIntelligence', () => {
  it('returns default minimal_normal intelligence for empty context', () => {
    const intel = deriveWeeklyIntelligence({});
    expect(intel.lane).toBe('minimal_normal');
    expect(intel.headline).toBe('First week of clean sessions');
  });

  it('fills template with completedSessions and totalSessions', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'student',
      completedSessions: 5,
      totalSessions: 7,
    });
    expect(intel.primaryMetricValue).toBe('5 of 7 blocks held');
  });

  it('fills template with cleanStarts for game_like', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'game_like',
      cleanStarts: 7,
    });
    expect(intel.primaryMetricValue).toBe('7 clean starts this week');
  });

  it('fills template with duration for minimal_normal', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'minimal_normal',
      completedSessions: 5,
      totalSessions: 7,
      duration: 25,
    });
    expect(intel.primaryMetricValue).toBe('5 of 7 sessions this week');
  });

  it('enriches student adjustment with reviewItemsDue', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'student',
      completedSessions: 5,
      totalSessions: 7,
      reviewItemsDue: 3,
    });
    expect(intel.adjustment).toContain('3 review items waiting');
  });

  it('enriches student adjustment with singular reviewItemsDue', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'student',
      completedSessions: 5,
      totalSessions: 7,
      reviewItemsDue: 1,
    });
    expect(intel.adjustment).toContain('1 review item waiting');
  });

  it('enriches game_like adjustment with blockerPatternsFound', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'game_like',
      completedSessions: 5,
      totalSessions: 7,
      blockerPatternsFound: 2,
    });
    expect(intel.adjustment).toContain('2 blocker patterns surfaced');
  });

  it('enriches deep_creative with stale projects', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'deep_creative',
      completedSessions: 5,
      totalSessions: 7,
      staleProjects: 2,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain('2 projects went stale');
  });

  it('enriches deep_creative with active projects (no stale)', () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: 'deep_creative',
      completedSessions: 5,
      totalSessions: 7,
      staleProjects: 0,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain('3 active projects');
    expect(intel.adjustment).toContain('Continuity is holding');
  });

  it('returns valid schema output for all lanes', () => {
    for (const lane of ALL_LANES) {
      const intel = deriveWeeklyIntelligence({ laneOverride: lane });
      expect(ModeWeeklyIntelligenceSchema.safeParse(intel).success).toBe(true);
    }
  });
});
