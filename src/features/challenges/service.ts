import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import * as repository from './repository';
import {
  AssignChallengeInputSchema,
  ChallengeProgressCheckResultSchema,
  DailyChallengeContextSchema,
  UpdateChallengeProgressInputSchema,
  type AssignChallengeInput,
  type ChallengeCompletionResult,
  type ChallengeDetail,
  type ChallengeProgressCheckResult,
  type DailyChallengeContext,
  type DailyChallengeTriggerType,
  type UpdateChallengeProgressInput,
  type UserChallenge,
} from './schemas';
import { ChallengeError, ChallengeNotFoundError, ChallengeNotActiveError } from './errors';
import { CONFIG, inferTriggerDelta, rewardBundleFor, toCompletionResult } from './helpers';
import { getActiveChallenges } from './queries';
import { claimChallengeReward } from './challenge-claim';

export { claimChallengeReward };

export async function assignChallenge(
  input: AssignChallengeInput,
): Promise<UserChallenge> {
  const validated = AssignChallengeInputSchema.parse(input);
  const challengeId = validated.challengeId;
  if (!challengeId) {
    throw new ChallengeError(
      'A concrete challengeId is required for assignment',
      'CHALLENGE_ID_REQUIRED',
    );
  }
  return repository.createUserChallenge(
    validated.userId,
    challengeId,
    Date.now() + CONFIG.DAILY_CHALLENGE_EXPIRY_HOURS * 60 * 60 * 1000,
  );
}

export async function updateChallengeProgress(
  input: UpdateChallengeProgressInput,
): Promise<ChallengeCompletionResult | null> {
  const validated = UpdateChallengeProgressInputSchema.parse(input);
  const [userChallenge, challenge] = await Promise.all([
    repository.fetchUserChallenge(validated.userId, validated.challengeId),
    repository.fetchChallengeById(validated.challengeId),
  ]);
  if (!userChallenge || !challenge) {
    throw new ChallengeNotFoundError(validated.challengeId);
  }
  if (userChallenge.status !== 'ACTIVE') {
    throw new ChallengeNotActiveError(
      validated.challengeId,
      userChallenge.status,
    );
  }
  const updated = await repository.addChallengeProgress(
    validated.userId,
    validated.challengeId,
    validated.delta,
    validated.source,
  );
  eventBus.publish('challenge:progress', {
    userId: validated.userId,
    challengeId: validated.challengeId,
    progress: updated.currentValue,
    target: challenge.targetValue,
    percent: Math.min(
      100,
      Math.round((updated.currentValue / challenge.targetValue) * 100),
    ),
  });
  if (updated.currentValue < challenge.targetValue) {
    return null;
  }
  return toCompletionResult(
    {
      challenge,
      userChallenge,
      ...rewardBundleFor(challenge),
      requiredCount: challenge.targetValue,
    },
    updated,
  );
}

export async function checkChallengeProgress(
  userId: string,
  triggerType: DailyChallengeTriggerType,
  context: DailyChallengeContext,
): Promise<ChallengeProgressCheckResult> {
  const validatedContext = DailyChallengeContextSchema.parse(context);
  try {
    const details = await getActiveChallenges(userId);
    const activeDetails = details.filter(
      (d) => d.userChallenge.status === 'ACTIVE',
    );
    const results = await Promise.all(
      activeDetails.map(async (detail) => {
        const delta = inferTriggerDelta(
          detail.challenge,
          triggerType,
          validatedContext,
        );
        if (delta <= 0) {return null;}
        const result = await updateChallengeProgress({
          userId,
          challengeId: detail.challenge.id,
          delta,
          source: triggerType,
          metadata: validatedContext,
        });
        return { detail, result };
      }),
    );
    const updated: ChallengeDetail[] = [];
    const completed: ChallengeCompletionResult[] = [];
    for (const r of results) {
      if (!r) {continue;}
      updated.push(r.detail);
      if (r.result) {completed.push(r.result);}
    }
    return ChallengeProgressCheckResultSchema.parse({ updated, completed });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'challenges', action: 'check-progress' },
    });
    throw error;
  }
}
