import { z } from 'zod';
import type { PurityLabel } from './active-session';
import type { ActiveSessionDisplayPolicy } from './active-session-display-policy';

const SignalPillSchema = z.object({
  type: z.enum(['boss', 'focus']),
  label: z.string(),
});

export const ActiveSessionHeroViewModelSchema = z.object({
  phaseIcon: z.enum(['clock', 'target']),
  phaseLabel: z.string(),
  phaseAccent: z.string(),
  studyTargetLabel: z.string().nullable(),
  completionPercentage: z.number(),
  elapsedSeconds: z.number(),
  remainingSeconds: z.number(),
  signalPill: SignalPillSchema.nullable(),
  momentumScores: z.array(z.number()).nullable(),
  dailyProgress: z.number().nullable(),
  todayFocusSeconds: z.number().nullable(),
  showPurityScore: z.boolean(),
  perfectFocusActive: z.boolean(),
  purityScore: z.number(),
  purityLabel: z.enum(['Elite', 'Good', 'Okay', 'Distracted']),
  streakMultiplier: z.number(),
  heroDensity: z.enum(['minimal', 'standard', 'rich']),
});

export type ActiveSessionHeroViewModel = z.infer<typeof ActiveSessionHeroViewModelSchema>;

export type BuildHeroViewModelInput = {
  completionPercentage: number;
  dailyProgress: number;
  displayPolicy: ActiveSessionDisplayPolicy;
  elapsedSeconds: number;
  momentumScores: number[];
  perfectFocusActive: boolean;
  phaseAccent: string;
  phaseIcon: 'clock' | 'target';
  phaseLabel: string;
  purityLabel: PurityLabel;
  purityScore: number;
  remainingSeconds: number;
  streakMultiplier: number;
  studyTargetLabel: string;
  todayFocusSeconds: number;
};

function buildSignalPill(
  displayPolicy: ActiveSessionDisplayPolicy,
  perfectFocusActive: boolean,
): { type: 'boss' | 'focus'; label: string } | null {
  if (displayPolicy.showBossTinyIndicator) {
    return { type: 'boss', label: 'Challenge waiting' };
  }
  if (perfectFocusActive && displayPolicy.heroDensity !== 'minimal') {
    return { type: 'focus', label: 'Clean focus' };
  }
  return null;
}

export function buildActiveSessionHeroViewModel(
  input: BuildHeroViewModelInput,
): ActiveSessionHeroViewModel {
  return {
    phaseIcon: input.phaseIcon,
    phaseLabel: input.phaseLabel,
    phaseAccent: input.phaseAccent,
    studyTargetLabel: input.displayPolicy.showStudyTarget ? input.studyTargetLabel : null,
    completionPercentage: input.completionPercentage,
    elapsedSeconds: input.elapsedSeconds,
    remainingSeconds: input.remainingSeconds,
    signalPill: buildSignalPill(input.displayPolicy, input.perfectFocusActive),
    momentumScores: input.displayPolicy.showMomentumScore ? input.momentumScores : null,
    dailyProgress: input.displayPolicy.showDailyProgress ? input.dailyProgress : null,
    todayFocusSeconds: input.displayPolicy.showDailyProgress ? input.todayFocusSeconds : null,
    showPurityScore: input.displayPolicy.showPurityScore,
    perfectFocusActive: input.displayPolicy.showPurityScore ? input.perfectFocusActive : false,
    purityScore: input.purityScore,
    purityLabel: input.purityLabel,
    streakMultiplier: input.streakMultiplier,
    heroDensity: input.displayPolicy.heroDensity,
  };
}
