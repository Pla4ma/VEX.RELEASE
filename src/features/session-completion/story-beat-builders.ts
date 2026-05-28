import type { CompletionLedger } from "./schemas";
import type { CompanionMemory } from "../companion/memory-types";
import type { CompanionPromise } from "../companion-promise/types";

export function formatMinutes(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} minutes`;
}

function buildGradeBody(ledger: CompletionLedger): string {
  if (ledger.interruptionCount === 0 && ledger.pauseCount === 0) {
    return `Your grade is ${ledger.grade} because you stayed clean through the close.`;
  }
  if (ledger.interruptionCount > 0) {
    return `Your grade is ${ledger.grade} because ${ledger.interruptionCount} interruption${ledger.interruptionCount === 1 ? "" : "s"} pulled on the session.`;
  }
  return `Your grade is ${ledger.grade} because ${ledger.pauseCount} pause${ledger.pauseCount === 1 ? "" : "s"} softened the pace.`;
}

function buildCompanionBeat(
  memory: CompanionMemory | null | undefined,
  reactionId: string | null,
) {
  if (memory) {
    return {
      accessibilityLabel: `Companion memory. ${memory.title}`,
      body: memory.body,
      companionLine: memory.title,
      id: "companion",
      kind: "companion" as const,
      metric: null,
      title: "Your companion remembered this one.",
    };
  }
  return {
    accessibilityLabel:
      "Companion reaction. Session recorded without a memory card.",
    body: "The session still landed, even though the memory layer stayed quiet this time.",
    companionLine: reactionId
      ? `Reaction saved: ${reactionId.replace(/-/g, " ")}.`
      : "The session still left a mark.",
    id: "companion",
    kind: "companion" as const,
    metric: null,
    title: "The session still reached your companion.",
  };
}

export interface PersonalBestProof {
  achievedAt: string;
  durationBucket: string;
  mode: string;
  newValue: number;
  oldValue: number | null;
}

export function computePersonalBestProof(input: {
  personalBest?: {
    achievedAt?: string;
    durationBucket?: string;
    isPersonalBest: boolean;
    previousBest?: number | null;
    purityScore?: number;
    sessionMode?: string;
  };
  completedAt: string;
  mode: string;
}): { proof: PersonalBestProof | null; body: string | null } {
  const proof =
    input.personalBest?.isPersonalBest &&
    input.personalBest.purityScore !== undefined
      ? {
          achievedAt:
            input.personalBest.achievedAt ??
            new Date(input.completedAt).toISOString(),
          durationBucket: input.personalBest.durationBucket ?? "focus block",
          mode: input.personalBest.sessionMode ?? input.mode,
          newValue: input.personalBest.purityScore,
          oldValue: input.personalBest.previousBest ?? null,
        }
      : null;
  const body = proof
    ? proof.oldValue === null
      ? `${proof.mode} ${proof.durationBucket} opened at ${proof.newValue} purity.`
      : `${proof.mode} ${proof.durationBucket} moved from ${proof.oldValue} to ${proof.newValue} purity.`
    : null;
  return { proof, body };
}

export interface StoryBeatContext {
  ledger: CompletionLedger;
  sessionMode: string;
  meaningBody: string;
  reflectionNextAction: string;
  companionMemory: CompanionMemory | null | undefined;
  companionPromise: CompanionPromise | null;
  personalBestProof: PersonalBestProof | null;
  personalBestBody: string | null;
  nextActionPresetMode: string | null;
}

export function buildStoryBeats(ctx: StoryBeatContext) {
  return [
    {
      accessibilityLabel: `Result beat. You focused for ${formatMinutes(ctx.ledger.effectiveFocusedSeconds)}.`,
      body: `You protected ${formatMinutes(ctx.ledger.effectiveFocusedSeconds)} in ${ctx.sessionMode}.`,
      companionLine: null,
      id: "result",
      kind: "result" as const,
      metric: {
        label: "Focused",
        value: formatMinutes(ctx.ledger.effectiveFocusedSeconds),
      },
      title: `You focused for ${formatMinutes(ctx.ledger.effectiveFocusedSeconds)}.`,
    },
    {
      accessibilityLabel: `Grade beat. ${buildGradeBody(ctx.ledger)}`,
      body: buildGradeBody(ctx.ledger),
      companionLine: null,
      id: "grade",
      kind: "grade" as const,
      metric: {
        label: "Grade",
        value: `${ctx.ledger.grade} · ${ctx.ledger.gradeScore}`,
      },
      title: `Grade ${ctx.ledger.grade}`,
    },
    {
      accessibilityLabel: `Meaning beat. ${ctx.meaningBody}`,
      body: ctx.meaningBody,
      companionLine: null,
      id: "meaning",
      kind: "meaning" as const,
      metric: {
        label: "Focus Score",
        value:
          ctx.ledger.focusScoreDelta >= 0
            ? `+${ctx.ledger.focusScoreDelta}`
            : `${ctx.ledger.focusScoreDelta}`,
      },
      title: "What changed today",
    },
    buildCompanionBeat(ctx.companionMemory, ctx.ledger.companionReactionId),
    ctx.personalBestProof
      ? {
          accessibilityLabel: `Personal best beat. Purity reached ${ctx.personalBestProof.newValue}.`,
          body:
            ctx.personalBestBody ??
            "You set a cleaner mark than your last saved best.",
          companionLine: null,
          id: "personal-best",
          kind: "personal_best" as const,
          metric: {
            label: "Purity record",
            value:
              ctx.personalBestProof.oldValue === null
                ? `${ctx.personalBestProof.newValue}`
                : `${ctx.personalBestProof.oldValue} -> ${ctx.personalBestProof.newValue}`,
          },
          title: "This one raised your ceiling.",
        }
      : null,
    {
      accessibilityLabel: `Tomorrow beat. ${ctx.reflectionNextAction}`,
      body: ctx.companionPromise
        ? `Tomorrow, ${ctx.companionPromise.targetDurationMinutes} minutes in ${ctx.companionPromise.targetMode.toLowerCase()} is enough to keep the thread alive.`
        : ctx.reflectionNextAction,
      companionLine:
        ctx.companionPromise?.status === "missed"
          ? "Yesterday got away. Start small and rebuild the thread."
          : null,
      id: "tomorrow",
      kind: "tomorrow" as const,
      metric: ctx.companionPromise
        ? {
            label: "Tomorrow",
            value: `${ctx.companionPromise.targetDurationMinutes}m`,
          }
        : {
            label: "Next mode",
            value: ctx.nextActionPresetMode ?? "HOME",
          },
      title: "Tomorrow already has a shape.",
    },
  ].filter(Boolean);
}
