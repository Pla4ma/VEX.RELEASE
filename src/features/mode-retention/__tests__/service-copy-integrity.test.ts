import { scoreModeRetention, buildDefaultAuditScores, getModeReturnHook, getModeRescueCopy, getModeNotificationCopy, getModePremiumBridge, getModeDayCopy, getModeRetentionManifest } from '../service';
import { MODE_RETENTION_MANIFEST, MODE_RETURN_HOOK, MODE_RETURN_REASON, MODE_DAY3_MEMORY, MODE_DAY7_INTELLIGENCE, MODE_RESCUE_COPY, MODE_NOTIFICATION_COPY, MODE_PREMIUM_BRIDGE } from '../copy';

describe('mode-retention copy integrity', () => {
  it('every lane has a return hook', () => {
    expect(Object.keys(MODE_RETURN_HOOK)).toHaveLength(4);
  });

  it('every lane has a return reason', () => {
    expect(Object.keys(MODE_RETURN_REASON)).toHaveLength(4);
  });

  it('every lane has a Day 3 memory', () => {
    expect(Object.keys(MODE_DAY3_MEMORY)).toHaveLength(4);
  });

  it('every lane has a Day 7 intelligence', () => {
    expect(Object.keys(MODE_DAY7_INTELLIGENCE)).toHaveLength(4);
  });

  it('every lane has rescue copy', () => {
    expect(Object.keys(MODE_RESCUE_COPY)).toHaveLength(4);
  });

  it('every lane has notification copy', () => {
    expect(Object.keys(MODE_NOTIFICATION_COPY)).toHaveLength(4);
  });

  it('every lane has premium bridge', () => {
    expect(Object.keys(MODE_PREMIUM_BRIDGE)).toHaveLength(4);
  });

  it('every lane has a complete manifest', () => {
    expect(Object.keys(MODE_RETENTION_MANIFEST)).toHaveLength(4);
  });

  it('no two modes share the same return reason', () => {
    const reasons = Object.values(MODE_RETURN_REASON);
    expect(new Set(reasons).size).toBe(4);
  });

  it('no two modes share the same Day 3 memory', () => {
    const memories = Object.values(MODE_DAY3_MEMORY);
    expect(new Set(memories).size).toBe(4);
  });

  it('no two modes share the same Day 7 intelligence', () => {
    const insights = Object.values(MODE_DAY7_INTELLIGENCE);
    expect(new Set(insights).size).toBe(4);
  });

  it('all rescue copy uses shame-reducing language', () => {
    for (const rescue of Object.values(MODE_RESCUE_COPY)) {
      const text = `${rescue.headline} ${rescue.body}`;
      expect(text).not.toMatch(/fail|missed|behind|should have/);
    }
  });

  it('no copy uses game reward language', () => {
    for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
      const text = JSON.stringify(copy);
      expect(text).not.toMatch(/boss|battle|coin|gem|reward.?chest|defeat|loot/);
    }
  });

  it('no copy uses streak guilt language', () => {
    for (const copy of Object.values(MODE_RETENTION_MANIFEST)) {
      const text = JSON.stringify(copy);
      expect(text).not.toMatch(/lost.*streak|broke.*streak|keep.*streak|don't.*break/);
    }
  });
});
