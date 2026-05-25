import { buildLaneSessionBrief } from '../service';

describe('lane session brief', () => {
  it.each([
    ['student', 'Start study block', 'STUDY'],
    ['game_like', 'Start encounter', 'SPRINT'],
    ['deep_creative', 'Resume project block', 'CREATIVE'],
    ['minimal_normal', 'Start clean session', 'LIGHT_FOCUS'],
  ] as const)('builds lane setup for %s', (lane, ctaLabel, sessionMode) => {
    const brief = buildLaneSessionBrief({ durationSeconds: 25 * 60, lane });

    expect(brief.ctaLabel).toBe(ctaLabel);
    expect(brief.sessionMode).toBe(sessionMode);
    expect(JSON.stringify(brief)).not.toMatch(/wager|insuranceCost|bountyCost|wallet|gem|shop|inventory/i);
    expect(brief.focusStrategyLoadout).toContain('Phone away');
  });

  it('keeps rescue setup between five and twelve minutes', () => {
    const brief = buildLaneSessionBrief({
      durationSeconds: 60 * 60,
      isRescue: true,
      lane: 'minimal_normal',
    });

    expect(brief.suggestedDurationSeconds).toBe(12 * 60);
    expect(brief.risk?.type).toBe('avoidance');
    expect(brief.friction?.level).toBe('soft');
  });

  it('keeps offline setup usable without heavy sync copy', () => {
    const brief = buildLaneSessionBrief({
      isOffline: true,
      lane: 'student',
    });

    expect(brief.offlineMessage).toContain('offline');
  });
});
