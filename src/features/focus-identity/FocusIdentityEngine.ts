import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from './focus-score-config';
import type {
  ScoreBand,
  FocusScoreFactors,
  FocusIdentityProfile,
} from './FocusIdentityEngine-types';

// Re-export types for backward compatibility
export type { ScoreBand, FocusScoreFactors, FocusIdentityProfile };
import {
  FocusScoreFactorsSchema,
  FocusIdentityProfileSchema,
} from './identity-schemas';
import {
  calculateFocusScore,
  type CalculateScoreInput,
  getScoreBand,
  calculateScoreChange,
} from './focus-score-calculators';

export type { CalculateScoreInput };
export { FOCUS_SCORE_CONFIG };

export class FocusIdentityEngine {
  public async calculateFocusScore(
    data: CalculateScoreInput,
  ): Promise<{ score: number; factors: FocusScoreFactors }> {
    return calculateFocusScore(data);
  }

  public getScoreBand(score: number): ScoreBand {
    return getScoreBand(score);
  }

  public getIdentityStatement(
    bandLabel: string,
    streakInBand: number,
  ): string {
    const statements =
      IDENTITY_STATEMENTS[bandLabel as keyof typeof IDENTITY_STATEMENTS] ??
      IDENTITY_STATEMENTS.Building;
    const index = Math.min(
      Math.floor(streakInBand / 7),
      statements.length - 1,
    );
    return statements[index]!;
  }

  public calculateScoreChange(
    eventType: keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES,
    modifiers: {
      streakLength?: number;
      sessionGrade?: string;
      isInRecovery?: boolean;
    },
  ): number {
    return calculateScoreChange(eventType, modifiers);
  }

  public generateRecommendations(factors: FocusScoreFactors): string[] {
    const recommendations: string[] = [];
    const factorScores = [
      {
        name: 'consistency' as const,
        score: factors.consistency.score,
        label: 'Consistency',
      },
      {
        name: 'streakStability' as const,
        score: factors.streakStability.score,
        label: 'Streak Stability',
      },
      {
        name: 'sessionQuality' as const,
        score: factors.sessionQuality.score,
        label: 'Session Quality',
      },
      {
        name: 'diversity' as const,
        score: factors.diversity.score,
        label: 'Diversity',
      },
      {
        name: 'recency' as const,
        score: factors.recency.score,
        label: 'Recent Activity',
      },
    ];
    const sorted = [...factorScores].sort((a, b) => a.score - b.score);
    const weakest = sorted[0]!;
    const strongest = sorted[sorted.length - 1]!;

    switch (weakest.name) {
      case 'consistency':
        recommendations.push(
          `Your ${weakest.label} is your biggest opportunity. Try the "Never Miss Twice" rule.`,
          'Set a minimum of 3 sessions per week to build momentum.',
        );
        break;
      case 'streakStability':
        recommendations.push(
          'Your streaks keep breaking. Try shorter, more achievable sessions (15-20 min).',
          'Use streak freeze items to protect your progress during busy weeks.',
        );
        break;
      case 'sessionQuality':
        recommendations.push(
          'Focus on quality over quantity. One perfect 45-min session beats three distracted ones.',
          'Turn on Do Not Disturb and put your phone in another room.',
        );
        break;
      case 'diversity':
        recommendations.push(
          'Mix up your routine! Try different session modes and times.',
          'Weekend warriors have higher long-term retention. Try a Saturday session.',
        );
        break;
      case 'recency':
        recommendations.push(
          "It's been a while. Start with just 10 minutes today to rebuild momentum.",
          "You're in recovery mode - all gains are 1.5x until you're back on track!",
        );
        break;
    }
    recommendations.push(
      `Your strength is ${strongest.label}. Use it to build other areas.`,
    );
    return recommendations;
  }

  public async getPercentileRank(score: number): Promise<number> {
    const band = this.getScoreBand(score);
    return band.percentile;
  }
}

// Re-export schemas for FocusIdentityService
export { FocusScoreFactorsSchema, FocusIdentityProfileSchema };
