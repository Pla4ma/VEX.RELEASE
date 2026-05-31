import type { SessionSummary } from '../../session/types';
import type { CompanionMemory } from '../companion/memory-types';
import type { CompanionPromise } from '../companion-promise/types';
import type { FocusContract } from '../focus-contract/types';
import { buildCompletionReflection } from './completion-reflection-service';
import { CompletionLedgerSchema, type CompletionLedger, type CompletionPersonalizationResult } from './schemas';
import { buildPostSessionNextAction } from './service';
import { selectHeadlineReward } from './headline-reward.service';
import { PostSessionStoryViewModelSchema, type PostSessionStoryViewModel } from './story-view-model-schema';
import { computePersonalBestProof, buildStoryBeats } from './story-beat-builders';

export { PostSessionStoryViewModelSchema, type PostSessionStoryViewModel };
export { getPostSessionStoryViewModel } from './story-view-model-fetcher';

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings: string[];
  ledger: CompletionLedger;
  personalBest?: {
    achievedAt?: string;
    durationBucket?: string;
    isPersonalBest: boolean;
    previousBest?: number | null;
    purityScore?: number;
    sessionMode?: string;
  };
  personalizationResult?: CompletionPersonalizationResult | null;
  companionMemory?: CompanionMemory | null;
  companionPromise?: CompanionPromise | null;
  focusContract?: FocusContract | null;
  summary: SessionSummary;
}): PostSessionStoryViewModel {
  const ledger = CompletionLedgerSchema.parse(input.ledger);
  const degradedWarnings = Array.from(new Set(input.degradedWarnings));
  const pr = input.personalizationResult ?? null;
  const sessionMode = input.summary.sessionMode ?? ledger.mode;
  const reflectionSummary = {
    ...input.summary,
    modeBonus: input.summary.modeBonus ?? 0,
    pausedTime: input.summary.pausedTime ?? input.summary.pausedDuration ?? 0,
    sessionMode,
  };
  const reflection = buildCompletionReflection({
    primaryGoal: sessionMode === 'STUDY' ? 'STUDY' : null,
    progressLabel:
      ledger.focusScoreDelta >= 0
        ? `+${ledger.focusScoreDelta} Focus Score`
        : `${ledger.focusScoreDelta} Focus Score`,
    sessionSummary: reflectionSummary,
    streakDays: ledger.streakResult.newDays,
  });
  const reflectionQuestion = pr?.reflectionQuestion ?? null;
  const reflectionBody =
    input.focusContract?.completionStatus === 'done'
      ? `${input.focusContract.taskDescription} landed. ${reflection.reflection}`
      : reflection.reflection;
  const meaningBody = reflectionQuestion
    ? `${reflectionQuestion} ${reflectionBody}`
    : reflectionBody;
  const nextAction = (() => {
    if (pr?.nextAction) {
      return pr.nextAction;
    }
    try {
      return buildPostSessionNextAction({ summary: input.summary });
    } catch (error: unknown) {
      return null;
    }
  })();
  const { proof: personalBestProof, body: personalBestBody } =
    computePersonalBestProof({
      personalBest: input.personalBest,
      completedAt: new Date(ledger.completedAt).toISOString(),
      mode: sessionMode,
    });
  const beats = buildStoryBeats({
    ledger,
    sessionMode,
    meaningBody,
    reflectionNextAction: reflection.nextAction,
    companionMemory: input.companionMemory,
    companionPromise: input.companionPromise ?? null,
    personalBestProof,
    personalBestBody,
    nextActionPresetMode: nextAction?.routeParams?.presetMode ?? null,
  });
  const headlineRaw = selectHeadlineReward({
    streak: {
      currentDays: ledger.streakResult.newDays,
      previousDays: ledger.streakResult.previousDays,
      streakSaved: ledger.streakResult.action === 'saved_by_insurance',
    },
    personalBest: input.personalBest,
    contract: { status: input.focusContract?.completionStatus ?? null },
    summary: {
      coinsEarned: 0,
      gemsEarned: 0,
      focusPurityScore: input.summary.focusPurityScore,
      newLevel: input.summary.userLevel,
      previousLevel: input.summary.userLevel,
      sessionMode: input.summary.sessionMode ?? ledger.mode,
      xpEarned: ledger.xpDelta,
    },
  });
  const headline =
    headlineRaw.type === 'xp_earned' && ledger.xpDelta > 0
      ? { ...headlineRaw, value: `+${ledger.xpDelta} XP` }
      : headlineRaw;
  return PostSessionStoryViewModelSchema.parse({
    beats,
    companionReaction: { reactionId: ledger.companionReactionId },
    companionMemory: input.companionMemory
      ? {
          memoryId: input.companionMemory.id,
          title: input.companionMemory.title,
          type: input.companionMemory.type,
        }
      : null,
    companionPromise: input.companionPromise
      ? {
          status: input.companionPromise.status,
          targetDate: input.companionPromise.targetDate,
          targetDurationMinutes: input.companionPromise.targetDurationMinutes,
          targetMode: input.companionPromise.targetMode,
        }
      : null,
    dailyMission: ledger.dailyMissionResult,
    degradedWarnings,
    focusScoreDeltaCard: {
      delta: ledger.focusScoreDelta,
      label:
        ledger.focusScoreDelta >= 0
          ? `Focus Score +${ledger.focusScoreDelta}`
          : `Focus Score ${ledger.focusScoreDelta}`,
    },
    gradeCard: {
      grade: ledger.grade,
      label: `Grade ${ledger.grade}`,
      score: ledger.gradeScore,
    },
    headline,
    nextActionCta: nextAction
      ? {
          label: nextAction.ctaLabel,
          reason: nextAction.reason,
          route: 'SessionSetup',
          routeParams: nextAction.routeParams,
        }
      : {
          label: 'Return home',
          reason: 'Home will hold the next safe move for you.',
          route: 'Home',
          routeParams: null,
        },
    pendingSync: ledger.offlineSyncStatus === 'pending_sync',
    personalBestProof,
    personalization: pr
      ? {
          laneProfileConfidence: pr.laneProfile.confidence,
          memoryCandidateCount: pr.memoryCandidates.length,
          reflectionQuestion: pr.reflectionQuestion,
          unlockKey: pr.unlockDecision.key,
          userFacingTitle: pr.userFacingSummary.displayTitle,
        }
      : null,
    rewardReveal: { rewardIds: ledger.rewardIds },
    sessionId: input.summary.sessionId,
    streakState: ledger.streakResult,
    xpProgress: { xpDelta: ledger.xpDelta },
  });
}
