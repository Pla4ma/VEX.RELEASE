/**
 * Study OS — Home Surface Tests
 *
 * Covers: buildStudyOsHomeSurface, buildDayZeroStudyPreview
 */

import { buildStudyOsHomeSurface, buildDayZeroStudyPreview } from '../service';
import { StudyPlanSchema, StudyOsHomeSurfaceSchema } from '../schemas';

// ─── Mock external dependencies ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock('../../../session/modes', () => ({
  SessionMode: {
    STUDY: 'STUDY',
    FOCUS: 'FOCUS',
  },
}));

jest.mock('../../session-start/service', () => ({
  buildLaneSessionBrief: jest.fn((input: { durationSeconds: number; lane: string }) => ({
    durationSeconds: input.durationSeconds,
    lane: input.lane,
    mode: 'study',
  })),
}));

// ─── buildStudyOsHomeSurface ─────────────────────────────────────

describe('buildStudyOsHomeSurface', () => {
  it('student lane shows study surface even without plan', () => {
    const surface = buildStudyOsHomeSurface({ lane: 'student', plan: null });
    expect(surface.hidden).toBe(false);
    expect(surface.title).toBe('Study OS');
    expect(surface.ctaLabel).toBe('Create study block');
  });

  it('non-student lane hides surface without plan', () => {
    expect(buildStudyOsHomeSurface({ lane: 'minimal_normal', plan: null }).hidden).toBe(true);
    expect(buildStudyOsHomeSurface({ lane: 'game_like', plan: null }).hidden).toBe(true);
    expect(buildStudyOsHomeSurface({ lane: 'deep_creative', plan: null }).hidden).toBe(true);
  });

  it('non-student lane shows surface when plan exists', () => {
    const plan = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: 'p1',
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: 'none', id: 's1', title: 'Math', type: 'manual', userId: 'u1' },
      status: 'active',
      title: 'Calculus',
      userId: 'u1',
    });
    const surface = buildStudyOsHomeSurface({ lane: 'minimal_normal', plan });
    expect(surface.hidden).toBe(false);
    expect(surface.title).toBe('Calculus');
    expect(surface.ctaLabel).toBe('Start study block');
  });

  it('offline shows fallback message', () => {
    const surface = buildStudyOsHomeSurface({
      isOffline: true,
      lane: 'student',
      plan: null,
    });
    expect(surface.offlineFallback).toContain('Offline');
  });

  it('online has null offline fallback', () => {
    const surface = buildStudyOsHomeSurface({ lane: 'student', plan: null });
    expect(surface.offlineFallback).toBeNull();
  });

  it('deadlineAt set shows risk label', () => {
    const plan = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: 999999,
      id: 'p1',
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: 'none', id: 's1', title: 'T', type: 'manual', userId: 'u1' },
      status: 'active',
      title: 'Title',
      userId: 'u1',
    });
    const surface = buildStudyOsHomeSurface({ lane: 'student', plan });
    expect(surface.riskLabel).toBe('Deadline risk active');
  });

  it('no deadline means null risk label', () => {
    const surface = buildStudyOsHomeSurface({ lane: 'student', plan: null });
    expect(surface.riskLabel).toBeNull();
  });
});

// ─── buildDayZeroStudyPreview ────────────────────────────────────

describe('buildDayZeroStudyPreview', () => {
  it('returns visible surface with start CTA', () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.hidden).toBe(false);
    expect(preview.ctaLabel).toBe('Start first study block');
    expect(preview.title).toContain('VEX helps you');
    expect(preview.riskLabel).toBeNull();
    expect(preview.offlineFallback).toBeNull();
  });

  it('validates against StudyOsHomeSurfaceSchema', () => {
    expect(() =>
      StudyOsHomeSurfaceSchema.parse(buildDayZeroStudyPreview()),
    ).not.toThrow();
  });
});
