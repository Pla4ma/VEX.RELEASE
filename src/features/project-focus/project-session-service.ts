import {
  ProjectThreadSchema,
  ProjectSessionBriefSchema,
  type ProjectThread,
  type ProjectSessionBrief,
} from './schemas';
import { listStoredProjectThreads, upsertStoredProjectThread } from './repository';
import {
  trackProjectSessionStarted,
  trackProjectThreadUpdated,
  trackProjectHandoffStored,
} from './analytics';

const STALE_AFTER_MS = 3 * 86_400_000;

function staleRisk(
  lastTouched: number,
  now: number,
): ProjectThread['staleRisk'] {
  const age = now - lastTouched;
  if (age >= STALE_AFTER_MS * 2) {return 'high';}
  if (age >= STALE_AFTER_MS) {return 'medium';}
  if (age >= 86_400_000) {return 'low';}
  return 'none';
}

export function buildProjectSessionBrief(
  thread: ProjectThread,
  now = Date.now(),
): ProjectSessionBrief {
  const risk = staleRisk(thread.lastTouched, now);
  const isRescued = thread.state === 'rescued';
  return ProjectSessionBriefSchema.parse({
    durationSeconds: isRescued ? 10 * 60 : risk === 'high' ? 15 * 60 : 25 * 60,
    successCondition: isRescued
      ? `Review: ${thread.lastSessionSummary ?? thread.currentObjective}`
      : thread.nextMove,
    title: isRescued
      ? `Recover ${thread.projectTitle}`
      : `Resume ${thread.projectTitle}`,
    warmup: isRescued
      ? `Lost the thread? Review: ${thread.lastSessionSummary ?? thread.currentObjective}`
      : thread.lastSessionSummary
        ? `Review: ${thread.lastSessionSummary}`
        : null,
  });
}

export function buildProjectResumeBrief(
  thread: ProjectThread,
  now = Date.now(),
): ProjectSessionBrief {
  const brief = buildProjectSessionBrief(thread, now);
  trackProjectSessionStarted(thread.projectTitle);
  return brief;
}

export type ProjectMemoryCandidate = {
  content: string;
  metadata: {
    projectTitle: string;
    threadId: string;
    state: ProjectThread['state'];
  };
  type: 'project_handoff';
};

export function buildProjectMemoryCandidate(
  thread: ProjectThread,
): ProjectMemoryCandidate {
  trackProjectHandoffStored(thread.projectTitle);
  return {
    content: [
      thread.handoffNote && `Handoff: ${thread.handoffNote}`,
      `Last summary: ${thread.lastSessionSummary ?? 'N/A'}`,
      `Next move: ${thread.nextMove}`,
      thread.blocker && `Blocker: ${thread.blocker}`,
    ]
      .filter(Boolean)
      .join('\n'),
    metadata: {
      projectTitle: thread.projectTitle,
      state: thread.state,
      threadId: thread.id,
    },
    type: 'project_handoff',
  };
}

export async function completeProjectSession(input: {
  blocker?: string | null;
  handoffNote?: string | null;
  lastSessionSummary: string;
  nextMove: string;
  openQuestion?: string | null;
  threadId: string;
  userId: string;
  now?: number;
}): Promise<ProjectThread> {
  const threads = await listStoredProjectThreads(input.userId);
  const thread = threads.find((item) => item.id === input.threadId);
  if (!thread) {throw new Error('Project thread could not be found.');}
  const now = input.now ?? Date.now();
  const updated = await upsertStoredProjectThread(
    ProjectThreadSchema.parse({
      ...thread,
      blocker: input.blocker ?? null,
      handoffNote: input.handoffNote ?? thread.handoffNote,
      lastSessionSummary: input.lastSessionSummary,
      lastTouched: now,
      nextMove: input.nextMove,
      openQuestions: input.openQuestion
        ? [...thread.openQuestions, input.openQuestion]
        : thread.openQuestions,
      staleRisk: 'none',
      state: input.blocker ? 'blocked' : 'active',
    }),
  );
  trackProjectThreadUpdated(updated.projectTitle, updated.state);
  return updated;
}
