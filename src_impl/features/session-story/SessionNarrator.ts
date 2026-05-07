/**
 * Session Narrator
 *
 * Phase 6: AI Evolution
 * Generates micro-narratives of each session for emotional memory
 *
 * Instead of "Session completed: 25 min", creates:
 * "You fought through 3 interruptions to defeat the Checkpoint Chaser"
 * "Pure focus for 12 minutes straight - your longest yet!"
 * "Epic comeback in the final 5 minutes to land the finishing blow"
 *
 * Creates emotional memory of productivity, making each session memorable
 *
 * Dependencies:
 * - session/SessionService (session data)
 * - features/boss-realtime (combat events)
 * - features/session-story (story generation)
 * - feature-flags (gradual rollout)
 */

import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";

// ============================================================================
// Narrative Types & Schemas
// ============================================================================

export const NarrativeBeatSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.enum(["OPENING", "INTERRUPTION", "RECOVERY", "PURE_FOCUS_STREAK", "COMBO_ACHIEVED", "BOSS_PHASE_CHANGE", "NEAR_DEATH_MOMENT", "FINAL_PUSH", "VICTORY", "DEFEAT"]),
  data: z.record(z.unknown()),
  narrativeText: z.string(),
  intensity: z.number().min(0).max(1), // 0 = calm, 1 = epic
});

export type NarrativeBeat = z.infer<typeof NarrativeBeatSchema>;

export interface SessionNarrative {
  sessionId: string;
  userId: string;
  createdAt: number;

  // Story beats
  beats: NarrativeBeat[];

  // Summary
  openingLine: string;
  closingLine: string;
  theme: "triumph" | "struggle" | "comeback" | "mastery" | "learning";

  // Stats for narrative
  totalInterruptions: number;
  longestPureStreak: number; // seconds
  comboCount: number;
  criticalHits: number;
  nearDeathMoments: number;

  // Emotional arc
  tensionGraph: number[]; // 0-100 over time
  climaxMoment: number; // timestamp of highest tension

  // Shareable card
  shareableSummary: string;
  heroQuote: string;
}

export interface NarrativeTemplate {
  id: string;
  type: NarrativeBeat["type"];
  conditions: Record<string, unknown>;
  templates: string[];
  intensity: number;
}

// ============================================================================
// Narrative Templates
// ============================================================================

const NARRATIVE_TEMPLATES: NarrativeTemplate[] = [
  {
    id: "opening_standard",
    type: "OPENING",
    conditions: {},
    templates: ["The journey begins...", "You enter the arena of focus.", "A new challenge awaits.", "The clock starts. Your focus is your weapon."],
    intensity: 0.2,
  },
  {
    id: "interruption_single",
    type: "INTERRUPTION",
    conditions: { count: 1 },
    templates: ["A distraction tests your resolve.", "The first interruption strikes.", "Focus wavers, but you hold the line."],
    intensity: 0.3,
  },
  {
    id: "interruption_multiple",
    type: "INTERRUPTION",
    conditions: { count: "multiple" },
    templates: ["The distractions mount. Each one you defeat makes you stronger.", "Battle-tested through {count} interruptions.", "Chaos swirls around you, but your focus remains unbroken."],
    intensity: 0.5,
  },
  {
    id: "recovery_quick",
    type: "RECOVERY",
    conditions: { recoveryTime: "quick" },
    templates: ["Swift recovery. Your focus muscle is strong.", "Back in the flow almost instantly."],
    intensity: 0.4,
  },
  {
    id: "pure_focus_streak_short",
    type: "PURE_FOCUS_STREAK",
    conditions: { duration: "short" },
    templates: ["{duration} minutes of pure, unbroken focus.", "The flow state takes hold."],
    intensity: 0.4,
  },
  {
    id: "pure_focus_streak_long",
    type: "PURE_FOCUS_STREAK",
    conditions: { duration: "long" },
    templates: ["An epic {duration}-minute streak of pure focus!", "Legendary concentration. Nothing can break your flow.", "The zone. {duration} minutes of pure mastery."],
    intensity: 0.7,
  },
  {
    id: "combo_achieved",
    type: "COMBO_ACHIEVED",
    conditions: {},
    templates: ["{combo}x COMBO! Pure focus amplified!", "The momentum builds. {combo} consecutive pure strikes!"],
    intensity: 0.6,
  },
  {
    id: "boss_rage",
    type: "BOSS_PHASE_CHANGE",
    conditions: { phase: "rage" },
    templates: ["The boss grows desperate. Its health dips below 25%.", "The enemy is wounded but dangerous."],
    intensity: 0.6,
  },
  {
    id: "near_death_epic",
    type: "NEAR_DEATH_MOMENT",
    conditions: {},
    templates: ["ALMOST THERE! The boss trembles at 10% health!", "The final push. Victory is within reach!", "Tension peaks. One more focused push!"],
    intensity: 0.9,
  },
  {
    id: "final_push_close",
    type: "FINAL_PUSH",
    conditions: { margin: "close" },
    templates: ["With seconds remaining, you land the final blow!", "A dramatic finish! Victory snatched at the last moment!"],
    intensity: 0.95,
  },
  {
    id: "victory_triumph",
    type: "VICTORY",
    conditions: { healthRemaining: "high" },
    templates: ["DOMINANT VICTORY! The boss stood no chance.", "Masterful performance. Pure focus prevails."],
    intensity: 0.8,
  },
  {
    id: "victory_comeback",
    type: "VICTORY",
    conditions: { healthRemaining: "low" },
    templates: ["EPIC COMEBACK! Against all odds, you emerge victorious!", "The comeback is complete! Never give up!"],
    intensity: 1.0,
  },
  {
    id: "defeat_close",
    type: "DEFEAT",
    conditions: { margin: "close" },
    templates: ["So close! The boss escaped with mere slivers of health.", "A noble effort. Next time, victory is yours."],
    intensity: 0.5,
  },
];

// ============================================================================
// Hero Quotes by Theme
// ============================================================================

const HERO_QUOTES: Record<SessionNarrative["theme"], string[]> = {
  triumph: ['"Discipline is choosing between what you want now and what you want most."', '"The only bad workout is the one that didn\'t happen."', '"Success is the sum of small efforts, repeated day in and day out."'],
  struggle: ['"The struggle you\'re in today is developing the strength you need for tomorrow."', '"It does not matter how slowly you go as long as you do not stop."', '"Every expert was once a beginner."'],
  comeback: ["\"It's not whether you get knocked down, it's whether you get up.\"", '"The comeback is always stronger than the setback."', '"Fall seven times, stand up eight."'],
  mastery: ['"Mastery is not a function of genius or talent. It is a function of time and intense focus."', '"The master has failed more times than the beginner has even tried."'],
  learning: ['"Every session is a lesson. Every interruption is a teacher."', '"Progress, not perfection."'],
};

// ============================================================================
// Session Narrator Service
// ============================================================================

export class SessionNarrator {
  private narratives: Map<string, SessionNarrative> = new Map();

  /**
   * Check if narrator is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled("session_narrator");
  }

  /**
   * Start narrative tracking for a session
   */
  startNarrative(sessionId: string, userId: string): SessionNarrative {
    const narrative: SessionNarrative = {
      sessionId,
      userId,
      createdAt: Date.now(),
      beats: [],
      openingLine: this.selectTemplate("OPENING", {}),
      closingLine: "",
      theme: "learning",
      totalInterruptions: 0,
      longestPureStreak: 0,
      comboCount: 0,
      criticalHits: 0,
      nearDeathMoments: 0,
      tensionGraph: [20], // Start at 20% tension
      climaxMoment: 0,
      shareableSummary: "",
      heroQuote: "",
    };

    this.narratives.set(sessionId, narrative);

    // Emit opening beat
    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_open`,
      timestamp: Date.now(),
      type: "OPENING",
      data: {},
      narrativeText: narrative.openingLine,
      intensity: 0.2,
    });

    return narrative;
  }

  /**
   * Record an interruption
   */
  recordInterruption(sessionId: string, recoveryTime: number): void {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return;
    }

    narrative.totalInterruptions++;

    // Determine template based on interruption count
    const template = narrative.totalInterruptions === 1 ? this.selectTemplate("INTERRUPTION", { count: 1 }) : this.selectTemplate("INTERRUPTION", { count: "multiple" });

    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_int`,
      timestamp: Date.now(),
      type: "INTERRUPTION",
      data: { count: narrative.totalInterruptions, recoveryTime },
      narrativeText: template.replace("{count}", String(narrative.totalInterruptions)),
      intensity: Math.min(0.5, 0.3 + narrative.totalInterruptions * 0.1),
    });

    // Recovery beat if quick
    if (recoveryTime < 10) {
      this.addBeat(sessionId, {
        id: `beat_${Date.now()}_rec`,
        timestamp: Date.now(),
        type: "RECOVERY",
        data: { recoveryTime },
        narrativeText: this.selectTemplate("RECOVERY", { recoveryTime: "quick" }),
        intensity: 0.4,
      });
    }

    // Update tension
    narrative.tensionGraph.push(Math.min(100, narrative.tensionGraph[narrative.tensionGraph.length - 1] + 10));
  }

  /**
   * Record pure focus streak
   */
  recordPureFocusStreak(sessionId: string, durationSeconds: number): void {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return;
    }

    narrative.longestPureStreak = Math.max(narrative.longestPureStreak, durationSeconds);

    const durationMinutes = Math.floor(durationSeconds / 60);
    if (durationMinutes < 2) {
      return;
    } // Only record significant streaks

    const isLong = durationMinutes >= 10;
    const template = isLong ? this.selectTemplate("PURE_FOCUS_STREAK", { duration: "long" }) : this.selectTemplate("PURE_FOCUS_STREAK", { duration: "short" });

    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_pure`,
      timestamp: Date.now(),
      type: "PURE_FOCUS_STREAK",
      data: { durationSeconds, durationMinutes },
      narrativeText: template.replace("{duration}", String(durationMinutes)),
      intensity: isLong ? 0.7 : 0.4,
    });

    // Update tension (calm during pure focus)
    narrative.tensionGraph.push(Math.max(10, narrative.tensionGraph[narrative.tensionGraph.length - 1] - 15));
  }

  /**
   * Record combo achievement
   */
  recordCombo(sessionId: string, comboCount: number): void {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return;
    }

    narrative.comboCount = Math.max(narrative.comboCount, comboCount);

    if (comboCount < 3) {
      return;
    } // Only significant combos

    const template = this.selectTemplate("COMBO_ACHIEVED", {});

    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_combo`,
      timestamp: Date.now(),
      type: "COMBO_ACHIEVED",
      data: { comboCount },
      narrativeText: template.replace("{combo}", String(comboCount)),
      intensity: Math.min(0.9, 0.5 + comboCount * 0.1),
    });

    narrative.tensionGraph.push(Math.min(100, narrative.tensionGraph[narrative.tensionGraph.length - 1] + 20));
  }

  /**
   * Record boss combat events
   */
  recordBossEvent(sessionId: string, eventType: "BOSS_PHASE_CHANGE" | "NEAR_DEATH_MOMENT" | "FINAL_PUSH" | "VICTORY" | "DEFEAT", data: Record<string, unknown>): void {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return;
    }

    let template = "";
    let intensity = 0.5;

    switch (eventType) {
      case "BOSS_PHASE_CHANGE":
        if (data.phase === "rage") {
          template = this.selectTemplate("BOSS_PHASE_CHANGE", { phase: "rage" });
          intensity = 0.6;
        }
        break;

      case "NEAR_DEATH_MOMENT":
        narrative.nearDeathMoments++;
        template = this.selectTemplate("NEAR_DEATH_MOMENT", {});
        intensity = 0.9;
        narrative.climaxMoment = Date.now();
        break;

      case "FINAL_PUSH":
        template = this.selectTemplate("FINAL_PUSH", { margin: data.close ? "close" : "comfortable" });
        intensity = 0.95;
        break;

      case "VICTORY":
        const healthRemaining = (data.healthRemaining as number) || 0;
        const isComeback = healthRemaining < 10;
        template = isComeback ? this.selectTemplate("VICTORY", { healthRemaining: "low" }) : this.selectTemplate("VICTORY", { healthRemaining: "high" });
        intensity = isComeback ? 1.0 : 0.8;
        narrative.theme = isComeback ? "comeback" : "triumph";
        break;

      case "DEFEAT":
        const close = (data.close as boolean) || false;
        template = close ? this.selectTemplate("DEFEAT", { margin: "close" }) : "The boss prevails this time. Tomorrow is another day.";
        intensity = close ? 0.5 : 0.3;
        narrative.theme = "struggle";
        break;
    }

    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_${eventType.toLowerCase()}`,
      timestamp: Date.now(),
      type: eventType,
      data,
      narrativeText: template,
      intensity,
    });

    narrative.tensionGraph.push(Math.min(100, intensity * 100));
  }

  /**
   * Finalize narrative at session end
   */
  finalizeNarrative(
    sessionId: string,
    sessionCompleted: boolean,
    finalStats: {
      duration: number;
      purity: number;
      bossDefeated: boolean;
    },
  ): SessionNarrative {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      throw new Error(`Narrative not found for session ${sessionId}`);
    }

    // Determine theme if not set
    if (narrative.theme === "learning") {
      if (narrative.totalInterruptions > 3) {
        narrative.theme = "struggle";
      } else if (finalStats.bossDefeated && narrative.nearDeathMoments > 0) {
        narrative.theme = "comeback";
      } else if (finalStats.purity > 90) {
        narrative.theme = "mastery";
      } else if (finalStats.bossDefeated) {
        narrative.theme = "triumph";
      }
    }

    // Generate closing line
    narrative.closingLine = this.generateClosingLine(narrative, finalStats);

    // Generate shareable summary
    narrative.shareableSummary = this.generateShareableSummary(narrative, finalStats);

    // Select hero quote
    narrative.heroQuote = this.selectHeroQuote(narrative.theme);

    // Add closing beat
    this.addBeat(sessionId, {
      id: `beat_${Date.now()}_close`,
      timestamp: Date.now(),
      type: sessionCompleted ? "VICTORY" : "DEFEAT",
      data: finalStats,
      narrativeText: narrative.closingLine,
      intensity: finalStats.bossDefeated ? 0.8 : 0.3,
    });

    // Emit narrative complete event
    // Note: Event channel type fixed - re-enabled
    eventBus.publish('narrative:session_complete', {
      sessionId,
      userId: narrative.userId,
      theme: narrative.theme,
      summary: narrative.shareableSummary,
    });

    return narrative;
  }

  /**
   * Get narrative for a session
   */
  getNarrative(sessionId: string): SessionNarrative | null {
    return this.narratives.get(sessionId) || null;
  }

  /**
   * Get story card data for sharing
   */
  getStoryCard(sessionId: string): {
    title: string;
    subtitle: string;
    heroQuote: string;
    stats: string[];
    theme: SessionNarrative["theme"];
    color: string;
  } | null {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return null;
    }

    const themeColors: Record<SessionNarrative["theme"], string> = {
      triumph: "#10B981",
      struggle: "#F59E0B",
      comeback: "#EF4444",
      mastery: "#8B5CF6",
      learning: "#3B82F6",
    };

    return {
      title: narrative.closingLine.slice(0, 50) + (narrative.closingLine.length > 50 ? "..." : ""),
      subtitle: narrative.shareableSummary,
      heroQuote: narrative.heroQuote,
      stats: [`${Math.floor(narrative.longestPureStreak / 60)}m pure focus streak`, `${narrative.totalInterruptions} interruptions overcome`, `${narrative.comboCount}x max combo`],
      theme: narrative.theme,
      color: themeColors[narrative.theme],
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private addBeat(sessionId: string, beat: NarrativeBeat): void {
    const narrative = this.narratives.get(sessionId);
    if (!narrative) {
      return;
    }

    narrative.beats.push(beat);
  }

  private selectTemplate(type: NarrativeBeat["type"], conditions: Record<string, unknown>): string {
    // Find matching templates
    const matching = NARRATIVE_TEMPLATES.filter((t) => {
      if (t.type !== type) {
        return false;
      }

      // Check conditions
      for (const [key, value] of Object.entries(conditions)) {
        if (t.conditions[key] !== value) {
          return false;
        }
      }

      return true;
    });

    if (matching.length === 0) {
      return "The session continues...";
    }

    // Random selection from matching
    const template = matching[Math.floor(Math.random() * matching.length)];
    return template.templates[Math.floor(Math.random() * template.templates.length)];
  }

  private generateClosingLine(narrative: SessionNarrative, stats: { duration: number; purity: number; bossDefeated: boolean }): string {
    if (!stats.bossDefeated) {
      return "The battle continues. You'll return stronger tomorrow.";
    }

    if (narrative.theme === "comeback") {
      return "Against all odds, you emerged victorious. Legendary! 🏆";
    }

    if (narrative.theme === "mastery") {
      return "Pure mastery on display. The boss never stood a chance. ⚔️";
    }

    if (narrative.totalInterruptions > 3) {
      return `Victory through perseverance. You overcame ${narrative.totalInterruptions} interruptions to claim victory! 💪`;
    }

    return "Victory! Your focus was unbreakable. 🎉";
  }

  private generateShareableSummary(narrative: SessionNarrative, stats: { duration: number; purity: number; bossDefeated: boolean }): string {
    const parts: string[] = [];

    if (stats.duration > 0) {
      parts.push(`${Math.floor(stats.duration / 60)} minute session`);
    }

    if (narrative.totalInterruptions > 0) {
      parts.push(`fought through ${narrative.totalInterruptions} interruptions`);
    }

    if (narrative.longestPureStreak > 300) {
      parts.push(`${Math.floor(narrative.longestPureStreak / 60)} min pure focus streak`);
    }

    if (stats.bossDefeated) {
      parts.push("boss defeated");
    }

    return parts.join(", ") + ".";
  }

  private selectHeroQuote(theme: SessionNarrative["theme"]): string {
    const quotes = HERO_QUOTES[theme];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let narrator: SessionNarrator | null = null;

export function getSessionNarrator(): SessionNarrator {
  if (!narrator) {
    narrator = new SessionNarrator();
  }
  return narrator;
}
