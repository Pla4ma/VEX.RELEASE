import type { SessionNarrative, NarrativeBeat } from './narrative-schemas';
import { lastElement, pickTemplateLine } from './narrative-helpers';
import { addBeatToNarrative } from './narrative-formatters';

function pushBeat(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  beat: NarrativeBeat,
): void {
  addBeatToNarrative(narratives, sessionId, beat);
}

export function recordInterruption(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  recoveryTime: number,
): void {
  const narrative = narratives.get(sessionId);
  if (!narrative) {return;}
  narrative.totalInterruptions++;
  const tmpl = narrative.totalInterruptions === 1
    ? pickTemplateLine('INTERRUPTION', { count: 1 })
    : pickTemplateLine('INTERRUPTION', { count: 'multiple' });
  pushBeat(narratives, sessionId, {
    id: `beat_${Date.now()}_int`,
    timestamp: Date.now(),
    type: 'INTERRUPTION',
    data: { count: narrative.totalInterruptions, recoveryTime },
    narrativeText: tmpl.replace('{count}', String(narrative.totalInterruptions)),
    intensity: Math.min(0.5, 0.3 + narrative.totalInterruptions * 0.1),
  });
  if (recoveryTime < 10) {
    pushBeat(narratives, sessionId, {
      id: `beat_${Date.now()}_rec`,
      timestamp: Date.now(),
      type: 'RECOVERY',
      data: { recoveryTime },
      narrativeText: pickTemplateLine('RECOVERY', { recoveryTime: 'quick' }),
      intensity: 0.4,
    });
  }
  narrative.tensionGraph.push(
    Math.min(100, lastElement(narrative.tensionGraph) + 10),
  );
}

export function recordPureFocusStreak(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  durationSeconds: number,
): void {
  const narrative = narratives.get(sessionId);
  if (!narrative) {return;}
  narrative.longestPureStreak = Math.max(narrative.longestPureStreak, durationSeconds);
  const durationMinutes = Math.floor(durationSeconds / 60);
  if (durationMinutes < 2) {return;}
  const isLong = durationMinutes >= 10;
  const tmpl = isLong
    ? pickTemplateLine('PURE_FOCUS_STREAK', { duration: 'long' })
    : pickTemplateLine('PURE_FOCUS_STREAK', { duration: 'short' });
  pushBeat(narratives, sessionId, {
    id: `beat_${Date.now()}_pure`,
    timestamp: Date.now(),
    type: 'PURE_FOCUS_STREAK',
    data: { durationSeconds, durationMinutes },
    narrativeText: tmpl.replace('{duration}', String(durationMinutes)),
    intensity: isLong ? 0.7 : 0.4,
  });
  narrative.tensionGraph.push(
    Math.max(10, lastElement(narrative.tensionGraph) - 15),
  );
}

export function recordCombo(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  comboCount: number,
): void {
  const narrative = narratives.get(sessionId);
  if (!narrative) {return;}
  narrative.comboCount = Math.max(narrative.comboCount, comboCount);
  if (comboCount < 3) {return;}
  const tmpl = pickTemplateLine('COMBO_ACHIEVED', {});
  pushBeat(narratives, sessionId, {
    id: `beat_${Date.now()}_combo`,
    timestamp: Date.now(),
    type: 'COMBO_ACHIEVED',
    data: { comboCount },
    narrativeText: tmpl.replace('{combo}', String(comboCount)),
    intensity: Math.min(0.9, 0.5 + comboCount * 0.1),
  });
  narrative.tensionGraph.push(
    Math.min(100, lastElement(narrative.tensionGraph) + 20),
  );
}

export function recordBossEvent(
  narratives: Map<string, SessionNarrative>,
  sessionId: string,
  eventType: 'BOSS_PHASE_CHANGE' | 'NEAR_DEATH_MOMENT' | 'FINAL_PUSH' | 'VICTORY' | 'DEFEAT',
  data: Record<string, unknown>,
): void {
  const narrative = narratives.get(sessionId);
  if (!narrative) {return;}
  let tmpl = '';
  let intensity = 0.5;
  switch (eventType) {
    case 'BOSS_PHASE_CHANGE':
      if (data.phase === 'rage') {
        tmpl = pickTemplateLine('BOSS_PHASE_CHANGE', { phase: 'rage' });
        intensity = 0.6;
      }
      break;
    case 'NEAR_DEATH_MOMENT':
      narrative.nearDeathMoments++;
      tmpl = pickTemplateLine('NEAR_DEATH_MOMENT', {});
      intensity = 0.9;
      narrative.climaxMoment = Date.now();
      break;
    case 'FINAL_PUSH':
      tmpl = pickTemplateLine('FINAL_PUSH', {
        margin: data.close ? 'close' : 'comfortable',
      });
      intensity = 0.95;
      break;
    case 'VICTORY': {
      const healthRemaining = (data.healthRemaining as number) ?? 0;
      const isComeback = healthRemaining < 10;
      tmpl = isComeback
        ? pickTemplateLine('VICTORY', { healthRemaining: 'low' })
        : pickTemplateLine('VICTORY', { healthRemaining: 'high' });
      intensity = isComeback ? 1.0 : 0.8;
      narrative.theme = isComeback ? 'comeback' : 'triumph';
      break;
    }
    case 'DEFEAT': {
      const close = (data.close as boolean) || false;
      tmpl = close
        ? pickTemplateLine('DEFEAT', { margin: 'close' })
        : 'The boss prevails this time. Tomorrow is another day.';
      intensity = close ? 0.5 : 0.3;
      narrative.theme = 'struggle';
      break;
    }
  }
  pushBeat(narratives, sessionId, {
    id: `beat_${Date.now()}_${eventType.toLowerCase()}`,
    timestamp: Date.now(),
    type: eventType,
    data,
    narrativeText: tmpl,
    intensity,
  });
  narrative.tensionGraph.push(Math.min(100, intensity * 100));
}
