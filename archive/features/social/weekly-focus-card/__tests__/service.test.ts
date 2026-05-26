import { buildWeeklyFocusSummary } from '../service';
import type { WeeklyFocusData } from '../schemas';

const userId = '123e4567-e89b-12d3-a456-426614174000';

const baseData: WeeklyFocusData = {
  currentFocusScore: { score: 720 },
  currentStreakDays: 5,
  previousFocusScore: { score: 680 },
  sessions: [
    {
      completedAt: '2026-05-12T10:00:00.000Z',
      durationSeconds: 1800,
      mode: 'DEEP_WORK',
      qualityScore: 85,
    },
    {
      completedAt: '2026-05-13T10:00:00.000Z',
      durationSeconds: 1500,
      mode: 'SPRINT',
      qualityScore: 90,
    },
  ],
  userId,
  weekEndDate: '2026-05-17',
  weekStartDate: '2026-05-11',
};
const firstSession = baseData.sessions[0];

describe('buildWeeklyFocusSummary', () => {
  it('computes a normal week summary', () => {
    const result = buildWeeklyFocusSummary(baseData);

    expect(result.sessionsCompleted).toBe(2);
    expect(result.totalMinutes).toBe(55);
    expect(result.currentWeekScore).toBe(720);
    expect(result.previousWeekScore).toBe(680);
    expect(result.scoreDelta).toBe(40);
    expect(result.currentBand).toBe('Exceptional');
    expect(result.currentStreakDays).toBe(5);
    expect(result.bestSession?.durationMinutes).toBe(30);
    expect(result.isEmpty).toBe(false);
  });

  it('returns an honest empty summary', () => {
    const result = buildWeeklyFocusSummary({
      ...baseData,
      currentFocusScore: null,
      currentStreakDays: 0,
      previousFocusScore: null,
      sessions: [],
    });

    expect(result.totalMinutes).toBe(0);
    expect(result.sessionsCompleted).toBe(0);
    expect(result.currentWeekScore).toBeNull();
    expect(result.scoreDelta).toBeNull();
    expect(result.bestSession).toBeNull();
    expect(result.insight).toBe('nothing_yet');
    expect(result.isEmpty).toBe(true);
  });

  it('handles missing focus score', () => {
    const result = buildWeeklyFocusSummary({
      ...baseData,
      currentFocusScore: null,
      previousFocusScore: null,
    });

    expect(result.currentWeekScore).toBeNull();
    expect(result.previousWeekScore).toBeNull();
    expect(result.scoreDelta).toBeNull();
    expect(result.currentBand).toBeNull();
  });

  it('prefers quality insight for longer average sessions', () => {
    const result = buildWeeklyFocusSummary({
      ...baseData,
      currentFocusScore: null,
      currentStreakDays: 0,
      previousFocusScore: null,
      sessions: firstSession ? [firstSession] : [],
    });

    expect(result.insight).toBe('quality_over_quantity');
  });
});
