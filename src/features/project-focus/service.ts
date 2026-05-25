import { ProjectHomeSurfaceSchema, ProjectSessionBriefSchema, ProjectThreadSchema, type ProjectHomeSurface, type ProjectSessionBrief, type ProjectThread } from './schemas';
import { listStoredProjectThreads, upsertStoredProjectThread } from './repository';

const STALE_AFTER_MS = 3 * 86_400_000;

function threadId(userId: string, now: number): string {
  return `${userId}:project:${now}`;
}

function staleRisk(lastTouched: number, now: number): ProjectThread['staleRisk'] {
  const age = now - lastTouched;
  if (age >= STALE_AFTER_MS * 2) return 'high';
  if (age >= STALE_AFTER_MS) return 'medium';
  if (age >= 86_400_000) return 'low';
  return 'none';
}

export async function createProjectThread(input: {
  currentObjective: string;
  nextMove: string;
  projectTitle: string;
  userId: string;
  now?: number;
}): Promise<ProjectThread> {
  const now = input.now ?? Date.now();
  return upsertStoredProjectThread(ProjectThreadSchema.parse({
    bestSessionMode: 'CREATIVE',
    blocker: null,
    currentObjective: input.currentObjective,
    id: threadId(input.userId, now),
    lastSessionSummary: null,
    lastTouched: now,
    nextMove: input.nextMove,
    openQuestions: [],
    projectTitle: input.projectTitle,
    staleRisk: 'none',
    state: 'new',
    userId: input.userId,
  }));
}

export function buildProjectSessionBrief(thread: ProjectThread, now = Date.now()): ProjectSessionBrief {
  const risk = staleRisk(thread.lastTouched, now);
  return ProjectSessionBriefSchema.parse({
    durationSeconds: risk === 'high' ? 15 * 60 : 25 * 60,
    successCondition: thread.nextMove,
    title: `Resume ${thread.projectTitle}`,
    warmup: thread.lastSessionSummary ? `Review: ${thread.lastSessionSummary}` : null,
  });
}

export async function completeProjectSession(input: {
  blocker?: string | null;
  lastSessionSummary: string;
  nextMove: string;
  openQuestion?: string | null;
  threadId: string;
  userId: string;
  now?: number;
}): Promise<ProjectThread> {
  const threads = await listStoredProjectThreads(input.userId);
  const thread = threads.find((item) => item.id === input.threadId);
  if (!thread) throw new Error('Project thread could not be found.');
  const now = input.now ?? Date.now();
  return upsertStoredProjectThread(ProjectThreadSchema.parse({
    ...thread,
    blocker: input.blocker ?? null,
    lastSessionSummary: input.lastSessionSummary,
    lastTouched: now,
    nextMove: input.nextMove,
    openQuestions: input.openQuestion ? [...thread.openQuestions, input.openQuestion] : thread.openQuestions,
    staleRisk: 'none',
    state: input.blocker ? 'blocked' : 'active',
  }));
}

export function refreshProjectThreadState(thread: ProjectThread, now = Date.now()): ProjectThread {
  const risk = staleRisk(thread.lastTouched, now);
  return ProjectThreadSchema.parse({
    ...thread,
    staleRisk: risk,
    state: thread.state === 'completed' || thread.state === 'blocked'
      ? thread.state
      : risk === 'high' || risk === 'medium' ? 'stale' : thread.state,
  });
}

export function buildProjectHomeSurface(input: {
  lane: 'student' | 'game_like' | 'deep_creative' | 'minimal_normal';
  thread: ProjectThread | null;
}): ProjectHomeSurface {
  const hidden = input.lane === 'minimal_normal' && !input.thread;
  const thread = input.thread ? refreshProjectThreadState(input.thread) : null;
  return ProjectHomeSurfaceSchema.parse({
    ctaLabel: thread ? 'Resume project' : 'Create project',
    hidden,
    recoveryPrompt: thread?.state === 'stale' ? 'Re-enter with a short review block.' : thread?.blocker ?? null,
    title: thread?.nextMove ?? 'Project Thread',
  });
}
