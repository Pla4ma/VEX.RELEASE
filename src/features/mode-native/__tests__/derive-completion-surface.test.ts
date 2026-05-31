/**
 * Tests for deriveCompletionSurface — cold-start vs evidence-backed
 */
import { describe, it, expect } from '@jest/globals';
import { deriveCompletionSurface } from '../service-surface';
import { ModeCompletionSurfaceSchema } from '../schemas';
import type { Lane } from '../../lane-engine/types';

const ALL_LANES: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

// ═══════════════════════════════════════════════════════════════════════
// Cold-start (completedSessions < 3) — no overclaiming
// ═══════════════════════════════════════════════════════════════════════

describe('deriveCompletionSurface — cold-start (completedSessions < 3)', () => {
  it('student cold-start: null insightLabel, no weak-tracking claim', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'student',
      topic: 'Algorithms',
      weakTopicCount: 3,
    });
    expect(surface.headline).toBe('Study block done');
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain('may need review');
    expect(surface.body).not.toContain('weak spots');
  });

  it('game_like cold-start: null insightLabel, no strongest-signal claim', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'game_like',
      task: 'Ship feature',
      cleanStarts: 3,
      blockerDetected: true,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain('clean starts confirmed');
    expect(surface.body).not.toContain('blocker signal saved');
  });

  it('deep_creative cold-start: null insightLabel, no continuity claim', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'deep_creative',
      project: 'VEX redesign',
      handoffSaved: true,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain('Handoff note saved');
    expect(surface.body).not.toContain('Next move is locked');
  });

  it('minimal_normal cold-start: null insightLabel', () => {
    const surface = deriveCompletionSurface({});
    expect(surface.insightLabel).toBeNull();
    expect(surface.headline).toBe('Done');
  });

  it('cold-start: template fill still works for all lanes', () => {
    const studentSurface = deriveCompletionSurface({
      laneOverride: 'student',
      topic: 'Graph traversal',
    });
    expect(studentSurface.body).toContain('Graph traversal');

    const gameSurface = deriveCompletionSurface({
      laneOverride: 'game_like',
      task: 'Ship onboarding',
    });
    expect(gameSurface.body).toContain('Ship onboarding');

    const creativeSurface = deriveCompletionSurface({
      laneOverride: 'deep_creative',
      project: 'VEX redesign',
    });
    expect(creativeSurface.body).toContain('VEX redesign');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Evidence-backed (completedSessions >= 3) — claims backed by evidence
// ═══════════════════════════════════════════════════════════════════════

describe('deriveCompletionSurface — evidence-backed (completedSessions >= 3)', () => {
  it('student evidence: weakTopicCount enrichment active', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'student',
      topic: 'Algorithms',
      weakTopicCount: 1,
      completedSessions: 5,
    });
    expect(surface.body).toContain('1 topic may need review.');
    expect(surface.insightLabel).toBe('VEX found 1 weak area');
  });

  it('student evidence: plural weakTopicCount', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'student',
      topic: 'Algorithms',
      weakTopicCount: 3,
      completedSessions: 4,
    });
    expect(surface.body).toContain('3 topics may need review.');
  });

  it('student evidence: weakTopicCount 0 keeps default insightLabel', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'student',
      topic: 'Algorithms',
      weakTopicCount: 0,
      completedSessions: 5,
    });
    expect(surface.body).not.toContain('may need review');
    expect(surface.insightLabel).toBe('VEX tracked your weak spots for next block');
  });

  it('game_like evidence: clean starts enrichment active', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'game_like',
      task: 'Ship feature',
      cleanStarts: 3,
      completedSessions: 6,
    });
    expect(surface.body).toContain('3 clean starts confirmed');
    expect(surface.insightLabel).toBe('Clean starts are your strongest pattern');
  });

  it('game_like evidence: blockerDetected enrichment', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'game_like',
      task: 'Ship feature',
      blockerDetected: true,
      completedSessions: 4,
    });
    expect(surface.body).toContain('blocker signal saved');
    expect(surface.insightLabel).toBe('Blocker patterns tracked for next run');
  });

  it('game_like evidence: recoveryWin enrichment', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'game_like',
      task: 'Ship feature',
      recoveryWin: true,
      completedSessions: 5,
    });
    expect(surface.body).toContain('recovery win');
    expect(surface.insightLabel).toBe('Recovery runs build durable momentum');
  });

  it('deep_creative evidence: handoffSaved enrichment', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'deep_creative',
      project: 'VEX redesign',
      handoffSaved: true,
      completedSessions: 4,
    });
    expect(surface.body).toContain('Handoff note saved.');
    expect(surface.insightLabel).toBe('Next move is locked for tomorrow');
  });

  it('deep_creative evidence: staleRisk enrichment (none skipped)', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'deep_creative',
      project: 'VEX redesign',
      staleRisk: 'none',
      completedSessions: 4,
    });
    expect(surface.body).not.toContain('risk of going stale');
  });

  it('deep_creative evidence: staleRisk enrichment (high)', () => {
    const surface = deriveCompletionSurface({
      laneOverride: 'deep_creative',
      project: 'VEX redesign',
      staleRisk: 'high',
      completedSessions: 4,
    });
    expect(surface.body).toContain('high risk of going stale');
  });

  it('evidence: valid schema for all lanes', () => {
    for (const lane of ALL_LANES) {
      const surface = deriveCompletionSurface({ laneOverride: lane, completedSessions: 5 });
      const result = ModeCompletionSurfaceSchema.safeParse(surface);
      expect(result.success).toBe(true);
    }
  });
});

// Boundary tests moved to derive-completion-surface-boundary.test.ts
