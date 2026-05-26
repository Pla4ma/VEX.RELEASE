import type { SessionSummary } from '../../session/types';
import { buildPostSessionNextAction } from './service';
import { selectHeadlineReward } from './headline-reward.service';
import { CompletionLedgerSchema, type CompletionLedger, type CompletionPersonalizationResult } from './schemas';
import type { CompanionMemory } from '../companion/memory-types';
import { getMemories } from '../companion/memory-repository';
import type { CompanionPromise } from '../companion-promise/types';
import { getRecentPromises } from '../companion-promise/repository';
import { getContractForSession } from '../focus-contract/service';
import type { FocusContract } from '../focus-contract/types';
import { buildCompletionReflection } from './completion-reflection-service';
import { getCompletionLedgerBySessionId } from './repository';
import {
  PostSessionStoryViewModelSchema,
  type PostSessionStoryViewModel,
} from './story-view-model-schema';

export { PostSessionStoryViewModelSchema, type PostSessionStoryViewModel };

function formatMinutes(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} minutes`;
}

function buildGradeBody(ledger: CompletionLedger): string {
  if (ledger.interruptionCount === 0 && ledger.pauseCount === 0) {
    return `Your grade is ${ledger.grade} because you stayed clean through the close.`;
  }
  if (ledger.interruptionCount > 0) {
    return `Your grade is ${ledger.grade} because ${ledger.interruptionCount} interruption${ledger.interruptionCount === 1 ? '' : 's'} pulled on the session.`;
  }
  return `Your grade is ${ledger.grade} because ${ledger.pauseCount} pause${ledger.pauseCount === 1 ? '' : 's'} softened the pace.`;
}

function buildCompanionBeat(memory: CompanionMemory | null | undefined, reactionId: string | null) {
  if (memory) {
    return {
      accessibilityLabel: `Companion memory. ${memory.title}`,
      body: memory.body,
      companionLine: memory.title,
      id: 'companion',
      kind: 'companion' as const,
      metric: null,
      title: 'Your companion remembered this one.',
    };
  }
  return {
    accessibilityLabel: 'Companion reaction. Session recorded without a memory card.',
    body: 'The session still landed, even though the memory layer stayed quiet this time.',
    companionLine: reactionId ? `Reaction saved: ${reactionId.replace(/-/g, ' ')}.` : 'The session still left a mark.',
    id: 'companion',
    kind: 'companion' as const,
    metric: null,
    title: 'The session still reached your companion.',
  };
}

export function buildPostSessionStoryViewModel(input: {
  degradedWarnings: string[];
  ledger: CompletionLedger;
  personalBest?: { achievedAt?: string; durationBucket?: string; isPersonalBest: boolean; previousBest?: number | null; purityScore?: number; sessionMode?: string; };
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
    progressLabel: ledger.focusScoreDelta >= 0 ? `+${ledger.focusScoreDelta} Focus Score` : `${ledger.focusScoreDelta} Focus Score`,
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
    } catch {
      return null;
    }
  })();
  const personalBestProof = input.personalBest?.isPersonalBest && input.personalBest.purityScore !== undefined ? {
    achievedAt: input.personalBest.achievedAt ?? new Date(ledger.completedAt).toISOString(),
    durationBucket: input.personalBest.durationBucket ?? 'focus block',
    mode: input.personalBest.sessionMode ?? input.summary.sessionMode ?? ledger.mode,
    newValue: input.personalBest.purityScore,
    oldValue: input.personalBest.previousBest ?? null,
  } : null;
  const personalBestBody = personalBestProof
    ? personalBestProof.oldValue === null
      ? `${personalBestProof.mode} ${personalBestProof.durationBucket} opened at ${personalBestProof.newValue} purity.`
      : `${personalBestProof.mode} ${personalBestProof.durationBucket} moved from ${personalBestProof.oldValue} to ${personalBestProof.newValue} purity.`
    : null;
  const beats = [
    { accessibilityLabel: `Result beat. You focused for ${formatMinutes(ledger.effectiveFocusedSeconds)}.`, body: `You protected ${formatMinutes(ledger.effectiveFocusedSeconds)} in ${input.summary.sessionMode ?? ledger.mode}.`, companionLine: null, id: 'result', kind: 'result' as const, metric: { label: 'Focused', value: formatMinutes(ledger.effectiveFocusedSeconds) }, title: `You focused for ${formatMinutes(ledger.effectiveFocusedSeconds)}.` },
    { accessibilityLabel: `Grade beat. ${buildGradeBody(ledger)}`, body: buildGradeBody(ledger), companionLine: null, id: 'grade', kind: 'grade' as const, metric: { label: 'Grade', value: `${ledger.grade} · ${ledger.gradeScore}` }, title: `Grade ${ledger.grade}` },
    { accessibilityLabel: `Meaning beat. ${meaningBody}`, body: meaningBody, companionLine: null, id: 'meaning', kind: 'meaning' as const, metric: { label: 'Focus Score', value: ledger.focusScoreDelta >= 0 ? `+${ledger.focusScoreDelta}` : `${ledger.focusScoreDelta}` }, title: 'What changed today' },
    buildCompanionBeat(input.companionMemory, ledger.companionReactionId),
    personalBestProof ? { accessibilityLabel: `Personal best beat. Purity reached ${personalBestProof.newValue}.`, body: personalBestBody ?? 'You set a cleaner mark than your last saved best.', companionLine: null, id: 'personal-best', kind: 'personal_best' as const, metric: { label: 'Purity record', value: personalBestProof.oldValue === null ? `${personalBestProof.newValue}` : `${personalBestProof.oldValue} -> ${personalBestProof.newValue}` }, title: 'This one raised your ceiling.' } : null,
    { accessibilityLabel: `Tomorrow beat. ${reflection.nextAction}`, body: input.companionPromise ? `Tomorrow, ${input.companionPromise.targetDurationMinutes} minutes in ${input.companionPromise.targetMode.toLowerCase()} is enough to keep the thread alive.` : reflection.nextAction, companionLine: input.companionPromise?.status === 'missed' ? 'Yesterday got away. Start small and rebuild the thread.' : null, id: 'tomorrow', kind: 'tomorrow' as const, metric: input.companionPromise ? { label: 'Tomorrow', value: `${input.companionPromise.targetDurationMinutes}m` } : { label: 'Next mode', value: nextAction?.routeParams?.presetMode ?? 'HOME' }, title: 'Tomorrow already has a shape.' },
  ].filter(Boolean);
  const headline = selectHeadlineReward({
    streak: { currentDays: ledger.streakResult.newDays, previousDays: ledger.streakResult.previousDays, streakSaved: ledger.streakResult.action === 'saved_by_insurance' },
    personalBest: input.personalBest,
    contract: { status: input.focusContract?.completionStatus ?? null },
    summary: { coinsEarned: 0, gemsEarned: 0, focusPurityScore: input.summary.focusPurityScore, newLevel: input.summary.userLevel, previousLevel: input.summary.userLevel, sessionMode: input.summary.sessionMode ?? ledger.mode, xpEarned: ledger.xpDelta },
  });

  return PostSessionStoryViewModelSchema.parse({
    beats,
    companionReaction: { reactionId: ledger.companionReactionId },
    companionMemory: input.companionMemory ? { memoryId: input.companionMemory.id, title: input.companionMemory.title, type: input.companionMemory.type } : null,
    companionPromise: input.companionPromise ? { status: input.companionPromise.status, targetDate: input.companionPromise.targetDate, targetDurationMinutes: input.companionPromise.targetDurationMinutes, targetMode: input.companionPromise.targetMode } : null,
    dailyMission: ledger.dailyMissionResult,
    degradedWarnings,
    focusScoreDeltaCard: { delta: ledger.focusScoreDelta, label: ledger.focusScoreDelta >= 0 ? `Focus Score +${ledger.focusScoreDelta}` : `Focus Score ${ledger.focusScoreDelta}` },
    gradeCard: { grade: ledger.grade, label: `Grade ${ledger.grade}`, score: ledger.gradeScore },
    headline,
    nextActionCta: nextAction ? { label: nextAction.ctaLabel, reason: nextAction.reason, route: 'SessionSetup', routeParams: nextAction.routeParams } : { label: 'Return home', reason: 'Home will hold the next safe move for you.', route: 'Home', routeParams: null },
    pendingSync: ledger.offlineSyncStatus === 'pending_sync',
    personalBestProof,
    personalization: pr ? {
      laneProfileConfidence: pr.laneProfile.confidence,
      memoryCandidateCount: pr.memoryCandidates.length,
      reflectionQuestion: pr.reflectionQuestion,
      unlockKey: pr.unlockDecision.key,
      userFacingTitle: pr.userFacingSummary.displayTitle,
    } : null,
    rewardReveal: { rewardIds: ledger.rewardIds },
    sessionId: input.summary.sessionId,
    streakState: ledger.streakResult,
    xpProgress: { xpDelta: ledger.xpDelta },
  });
}

export async function getPostSessionStoryViewModel(input: {
  sessionId: string;
  summary: SessionSummary;
  userId: string | null;
}): Promise<PostSessionStoryViewModel | null> {
  const ledger = await getCompletionLedgerBySessionId(input.sessionId);
  if (!ledger) {
    return null;
  }
  const [memories, promises, focusContract] = input.userId
    ? await Promise.all([
        getMemories(input.userId),
        getRecentPromises(input.userId, 10),
        getContractForSession(input.sessionId, input.userId).catch(() => null),
      ])
    : [[], [], null];
  return buildPostSessionStoryViewModel({
    companionMemory: memories.find((memory) => memory.sessionId === input.sessionId) ?? null,
    companionPromise: promises.find((promise) => promise.sourceSessionId === input.sessionId) ?? null,
    degradedWarnings: ledger.degradedSystems,
    focusContract,
    ledger,
    personalizationResult: null,
    summary: input.summary,
  });
}
