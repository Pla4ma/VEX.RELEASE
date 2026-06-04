import type {
  BurnoutInput,
  PlateauInput,
  StreakRescueInput,
  BossStrategyInput,
  InterventionMessage,
  InterventionAction,
  CoachPersona,
} from './intervention-types';
import {
  detectBurnout,
  detectPlateau,
  detectStreakRescueNeeded,
  detectBossStrategyOpportunity,
} from './intervention-detectors';

export function evaluateInterventions(
  burnoutInput?: BurnoutInput,
  plateauInput?: PlateauInput,
  streakRescueInput?: StreakRescueInput,
  bossStrategyInput?: BossStrategyInput,
  _currentPersona: CoachPersona = 'MENTOR',
): {
  shouldIntervene: boolean;
  priority: number;
  intervention?: InterventionMessage;
  action?: InterventionAction;
  type: 'BURNOUT' | 'PLATEAU' | 'STREAK_RESCUE' | 'BOSS_STRATEGY' | 'NONE';
} {
  if (streakRescueInput) {
    const rescue = detectStreakRescueNeeded(streakRescueInput);
    if (rescue.needsRescue) {
      return {
        shouldIntervene: true,
        priority:
          rescue.urgency === 'CRITICAL'
            ? 10
            : rescue.urgency === 'HIGH'
              ? 8
              : 6,
        intervention: rescue.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: {
            duration: rescue.suggestedSessionDuration,
            type: 'STREAK_RESCUE',
          },
        },
        type: 'STREAK_RESCUE',
      };
    }
  }

  if (burnoutInput) {
    const burnout = detectBurnout(burnoutInput);
    if (burnout.detected) {
      return {
        shouldIntervene: true,
        priority:
          burnout.severity === 'SEVERE'
            ? 7
            : burnout.severity === 'MODERATE'
              ? 5
              : 3,
        intervention: burnout.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: {
            duration: burnout.suggestedSessionDuration,
            type: 'BURNOUT_RECOVERY',
          },
        },
        type: 'BURNOUT',
      };
    }
  }

  if (bossStrategyInput) {
    const boss = detectBossStrategyOpportunity(bossStrategyInput);
    if (boss.shouldShow) {
      return {
        shouldIntervene: true,
        priority:
          boss.priority === 'HIGH' ? 6 : boss.priority === 'MEDIUM' ? 4 : 2,
        intervention: boss.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: {
            duration: boss.strategy.recommendedDuration,
            type: 'BOSS_KILL',
            targetQuality: boss.strategy.targetQuality,
          },
        },
        type: 'BOSS_STRATEGY',
      };
    }
  }

  if (plateauInput) {
    const plateau = detectPlateau(plateauInput);
    if (plateau.detected) {
      return {
        shouldIntervene: true,
        priority:
          plateau.severity === 'SEVERE'
            ? 5
            : plateau.severity === 'MODERATE'
              ? 3
              : 2,
        intervention: plateau.intervention,
        action: {
          type: 'SUGGEST_SESSION',
          data: {
            duration: plateau.suggestedSessionDuration,
            type: 'PLATEAU_BREAKER',
          },
        },
        type: 'PLATEAU',
      };
    }
  }

  return { shouldIntervene: false, priority: 0, type: 'NONE' };
}
