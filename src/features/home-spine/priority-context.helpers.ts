import { fetchActiveChallengeDetails } from '../challenges/repository';

type ActiveChallengeDetail = Awaited<
  ReturnType<typeof fetchActiveChallengeDetails>
>[number];

export function calculateHoursRemaining(
  lastQualifyingSessionAt: number | null | undefined,
): number | undefined {
  if (typeof lastQualifyingSessionAt !== 'number') {
    return undefined;
  }
  const hoursElapsed =
    (Date.now() - lastQualifyingSessionAt) / (1000 * 60 * 60);
  return Math.max(0, Math.floor(24 - hoursElapsed));
}

export function calculateStreakAtRisk(
  lastQualifyingSessionAt: number | null | undefined,
): boolean {
  if (typeof lastQualifyingSessionAt !== 'number') {
    return false;
  }
  return (Date.now() - lastQualifyingSessionAt) / (1000 * 60 * 60) >= 18;
}

export function findNearDoneChallenge(
  challenges: ActiveChallengeDetail[],
): {
  id?: string;
  isNearDone: boolean;
  progressPercent: number;
  title?: string;
} {
  let match: { id: string; isNearDone: boolean; progressPercent: number; title: string } | undefined;
  for (const item of challenges) {
    if (item.challenge.type !== 'DAILY') continue;
    const isNearDone =
      item.challenge.targetValue > 0 &&
      item.userChallenge.status === 'ACTIVE' &&
      (item.userChallenge.currentValue / item.challenge.targetValue) * 100 >=
        70;
    if (!isNearDone) continue;
    const progressPercent =
      item.challenge.targetValue > 0
        ? Math.min(
            100,
            (item.userChallenge.currentValue / item.challenge.targetValue) *
              100,
          )
        : 0;
    if (!match || progressPercent > match.progressPercent) {
      match = {
        id: item.userChallenge.id,
        isNearDone: true,
        progressPercent,
        title: item.challenge.title,
      };
    }
  }

  return match ?? { isNearDone: false, progressPercent: 0 };
}
