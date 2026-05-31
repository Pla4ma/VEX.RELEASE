import type {
  ComputeTomorrowPreviewInput,
  TomorrowPreviewData,
} from './tomorrow-preview-schemas';
import { saveTomorrowPreview } from './tomorrow-preview-storage';
import {
  buildBossCandidate,
  buildRivalCandidate,
  buildStreakMilestoneCandidate,
} from './tomorrow-preview-candidates';

function buildPowerHourCandidate(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData | null {
  const powerHour = input.powerHourData;
  if (!powerHour) {
    return null;
  }
  return {
    actionPrompt: 'Set a reminder!',
    emoji: 'star',
    headline: 'Power Hour Tomorrow!',
    metadata: { day: powerHour.day, time: powerHour.time },
    priority: 4,
    subtext: `${powerHour.day} at ${powerHour.time} - Triple XP for 1 hour!`,
    type: 'POWER_HOUR',
  };
}

function buildChallengeCandidate(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData | null {
  const challenge = input.challengeData;
  if (!challenge || challenge.incompleteChallenges <= 0) {
    return null;
  }
  return {
    actionPrompt: 'Complete them all!',
    emoji: 'list',
    headline: `${challenge.incompleteChallenges} Challenges Reset`,
    metadata: {
      count: challenge.incompleteChallenges,
      xpAvailable: challenge.xpAvailable,
    },
    priority: 5,
    subtext: `+${challenge.xpAvailable} XP available in tomorrow's challenges.`,
    type: 'CHALLENGE_RESET',
  };
}

function buildFallback(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData {
  return {
    emoji: input.streakWillContinue ? '🔥' : '✨',
    headline: input.streakWillContinue
      ? 'Streak Continues!'
      : 'New Day, New Focus',
    priority: 6,
    subtext: input.streakWillContinue
      ? `Keep your ${input.currentStreakDays + 1}-day streak alive tomorrow!`
      : 'Tomorrow is a fresh start. Build your streak!',
    type: 'GENERIC',
  };
}

export function computeTomorrowPreview(
  input: ComputeTomorrowPreviewInput,
): TomorrowPreviewData {
  const candidates = [
    buildStreakMilestoneCandidate(input),
    buildBossCandidate(input),
    buildRivalCandidate(input),
    buildPowerHourCandidate(input),
    buildChallengeCandidate(input),
  ].filter((candidate): candidate is TomorrowPreviewData => candidate !== null);
  const preview =
    candidates.sort((a, b) => a.priority - b.priority)[0] ??
    buildFallback(input);
  saveTomorrowPreview(input.userId, preview);
  return preview;
}
