import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import { HERO_QUOTES } from './narrative-templates';
import {
  generateClosingLine,
  generateShareableSummary,
  addBeatToNarrative,
} from './narrative-formatters';
import {
  recordInterruption,
  recordPureFocusStreak,
  recordCombo,
  recordBossEvent,
} from './narrative-recorder';
import { randomPick, pickTemplateLine } from './narrative-helpers';
import { THEME_COLORS } from './narrative-schemas';
import type { NarrativeBeat, SessionNarrative, FinalStats, NarrativeTheme } from './narrative-schemas';

export type { NarrativeBeat, SessionNarrative, FinalStats, NarrativeTheme } from './narrative-schemas';
export { NarrativeBeatSchema, THEME_COLORS } from './narrative-schemas';

export class SessionNarrator {
  private narratives: Map<string, SessionNarrative> = new Map();

  static isEnabled(): boolean {
    return featureFlags.isEnabled('session_narrator');
  }

  startNarrative(sessionId: string, userId: string): SessionNarrative {
    const narrative: SessionNarrative = {
      sessionId,
      userId,
      createdAt: Date.now(),
      beats: [],
      openingLine: pickTemplateLine('OPENING', {}),
      closingLine: '',
      theme: 'learning',
      totalInterruptions: 0,
      longestPureStreak: 0,
      comboCount: 0,
      criticalHits: 0,
      nearDeathMoments: 0,
      tensionGraph: [20],
      climaxMoment: 0,
      shareableSummary: '',
      heroQuote: '',
    };
    this.narratives.set(sessionId, narrative);
    addBeatToNarrative(this.narratives, sessionId, {
      id: `beat_${Date.now()}_open`,
      timestamp: Date.now(),
      type: 'OPENING',
      data: {},
      narrativeText: narrative.openingLine,
      intensity: 0.2,
    });
    return narrative;
  }

  recordInterruption(sessionId: string, recoveryTime: number): void {
    recordInterruption(this.narratives, sessionId, recoveryTime);
  }

  recordPureFocusStreak(sessionId: string, durationSeconds: number): void {
    recordPureFocusStreak(this.narratives, sessionId, durationSeconds);
  }

  recordCombo(sessionId: string, comboCount: number): void {
    recordCombo(this.narratives, sessionId, comboCount);
  }

  recordBossEvent(
    sessionId: string,
    eventType: 'BOSS_PHASE_CHANGE' | 'NEAR_DEATH_MOMENT' | 'FINAL_PUSH' | 'VICTORY' | 'DEFEAT',
    data: Record<string, unknown>,
  ): void {
    recordBossEvent(this.narratives, sessionId, eventType, data);
  }

  finalizeNarrative(
    sessionId: string,
    sessionCompleted: boolean,
    finalStats: FinalStats,
  ): SessionNarrative {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      throw new Error(`Narrative not found for session ${sessionId}`);
    }
    if (narrative.theme === 'learning') {
      if (narrative.totalInterruptions > 3) {
        narrative.theme = 'struggle';
      } else if (finalStats.bossDefeated && narrative.nearDeathMoments > 0) {
        narrative.theme = 'comeback';
      } else if (finalStats.purity > 90) {
        narrative.theme = 'mastery';
      } else if (finalStats.bossDefeated) {
        narrative.theme = 'triumph';
      }
    }
    narrative.closingLine = generateClosingLine(narrative, finalStats);
    narrative.shareableSummary = generateShareableSummary(narrative, finalStats);
    narrative.heroQuote = randomPick(HERO_QUOTES[narrative.theme]);
    addBeatToNarrative(this.narratives, sessionId, {
      id: `beat_${Date.now()}_close`,
      timestamp: Date.now(),
      type: sessionCompleted ? 'VICTORY' : 'DEFEAT',
      data: finalStats as unknown as Record<string, unknown>,
      narrativeText: narrative.closingLine,
      intensity: finalStats.bossDefeated ? 0.8 : 0.3,
    });
    eventBus.publish('narrative:session_complete', {
      sessionId,
      userId: narrative.userId,
      theme: narrative.theme,
      summary: narrative.shareableSummary,
    });
    return narrative;
  }

  getNarrative(sessionId: string): SessionNarrative | null {
    return this.narratives.get(sessionId) ?? null;
  }

  getStoryCard(sessionId: string): {
    title: string;
    subtitle: string;
    heroQuote: string;
    stats: string[];
    theme: NarrativeTheme;
    color: string;
  } | null {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {return null;}
    return {
      title:
        narrative.closingLine.slice(0, 50) +
        (narrative.closingLine.length > 50 ? '...' : ''),
      subtitle: narrative.shareableSummary,
      heroQuote: narrative.heroQuote,
      stats: [
        `${Math.floor(narrative.longestPureStreak / 60)}m pure focus streak`,
        `${narrative.totalInterruptions} interruptions overcome`,
        `${narrative.comboCount}x max combo`,
      ],
      theme: narrative.theme,
      color: THEME_COLORS[narrative.theme],
    };
  }
}

let narrator: SessionNarrator | null = null;

export function getSessionNarrator(): SessionNarrator {
  if (!narrator) {
    narrator = new SessionNarrator();
  }
  return narrator;
}
