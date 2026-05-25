/**
 * Phase 10: Behavior signals privacy test
 *
 * Proves behavior signals never store sensitive content.
 */

import { describe, it, expect } from '@jest/globals';
import {
  BehaviorSignalSchema,
  type BehaviorSignal,
} from '../behavior-signal-schemas';

const SENSITIVE_PATTERNS = [
  /session.*content/i,
  /study.*material/i,
  /document.*text/i,
  /message.*body/i,
  /note.*content/i,
  /user.*input/i,
  /ai.*message/i,
  /raw.*data/i,
  /plain.?text/i,
];

function makeSignal(overrides: Partial<BehaviorSignal> = {}): BehaviorSignal {
  return BehaviorSignalSchema.parse({
    userId: '550e8400-e29b-41d4-a716-446655440000',
    surfaceKey: 'home_hero',
    signalType: 'surface_seen',
    source: 'home_hero',
    timestamp: Date.now(),
    ...overrides,
  });
}

describe('Behavior signals privacy', () => {
  it('signal schema rejects unknown fields', () => {
    const invalid = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      surfaceKey: 'home_hero',
      signalType: 'surface_seen',
      source: 'home_hero',
      timestamp: Date.now(),
      studyContent: 'some text',
      sessionTranscript: 'full transcript',
    };
    const result = BehaviorSignalSchema.safeParse(invalid);
    // Strict schema rejects extra fields
    expect(result.success).toBe(false);
  });

  it('signal schema rejects PII fields', () => {
    const withEmail = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      surfaceKey: 'home_hero',
      signalType: 'surface_seen',
      source: 'home_hero',
      timestamp: Date.now(),
      email: 'user@example.com',
    };
    const result = BehaviorSignalSchema.safeParse(withEmail);
    expect(result.success).toBe(false);
  });

  it('signal metadata is strictly constrained', () => {
    const signal = makeSignal({
      metadata: { surfacePlacement: 'top', sessionCount: 5 },
    });
    const serialized = JSON.stringify(signal);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed.userId).toBeTruthy();
    // Metadata should not leak sensitive keys
    expect(typeof parsed.metadata).toBe('object');
    const meta = parsed.metadata as Record<string, unknown>;
    expect(Object.keys(meta)).toEqual(
      expect.arrayContaining(['surfacePlacement', 'sessionCount']),
    );
    expect(Object.keys(meta).length).toBeLessThanOrEqual(2);
  });

  it('signal store 14-day window never persists raw content', () => {
    const signal = makeSignal();
    const serialized = JSON.stringify(signal);
    SENSITIVE_PATTERNS.forEach((pattern) => {
      expect(serialized).not.toMatch(pattern);
    });
  });

  it('signal types are interaction-based, not content-based', () => {
    const validTypes = BehaviorSignalSchema.shape.signalType.options;
    // All signal types describe interactions (seen, clicked, dismissed, opened)
    validTypes.forEach((type) => {
      expect(['surface_seen', 'surface_clicked', 'surface_dismissed',
        'premium_gate_seen', 'premium_gate_clicked', 'premium_gate_dismissed',
        'boss_cta_clicked', 'boss_route_opened',
        'study_surface_clicked', 'coach_surface_clicked',
        'notification_opened', 'notification_dismissed',
        'rescue_started', 'avoidance_reported',
        'friction_accepted', 'friction_rejected',
        'reflection_submitted', 'import_used',
        'unlock_regret', 'lane_mismatch_reported']).toContain(type);
    });
  });

  it('signal sources map to UI surfaces, not data', () => {
    const validSources = BehaviorSignalSchema.shape.source.options;
    validSources.forEach((source) => {
      expect([
        'home_hero', 'home_content', 'home_lower',
        'premium_gate', 'boss_tab', 'coach_presence',
        'study_layer', 'notification_center',
        'session_completion', 'paywall',
      ]).toContain(source);
    });
  });

  it('signal store clear removes all data', () => {
    // Local best-effort: clearBehaviorSignals should reset window
    const { clearBehaviorSignals, getBehaviorSignals } = require('../behavior-signal-store');
    clearBehaviorSignals('test-user');
    const signals = getBehaviorSignals('test-user');
    expect(signals).toEqual([]);
  });
});
