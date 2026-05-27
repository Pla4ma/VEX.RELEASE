import {
  ProjectHomeSurfaceSchema,
  ProjectSessionBriefSchema,
  ProjectThreadSchema,
  type ProjectHomeSurface,
  type ProjectSessionBrief,
  type ProjectThread,
} from "./schemas";
import {
  listStoredProjectThreads,
  upsertStoredProjectThread,
} from "./repository";
import {
  trackProjectThreadCreated,
  trackProjectSessionStarted,
  trackProjectThreadUpdated,
  trackProjectThreadRescued,
  trackProjectHandoffStored,
} from "./analytics";

const STALE_AFTER_MS = 3 * 86_400_000;

function threadId(userId: string, now: number): string {
  return `${userId}:project:${now}`;
}

function staleRisk(
  lastTouched: number,
  now: number,
): ProjectThread["staleRisk"] {
  const age = now - lastTouched;
  if (age >= STALE_AFTER_MS * 2) return "high";
  if (age >= STALE_AFTER_MS) return "medium";
  if (age >= 86_400_000) return "low";
  return "none";
}

export async function createProjectThread(input: {
  currentObjective: string;
  nextMove: string;
  projectTitle: string;
  userId: string;
  now?: number;
}): Promise<ProjectThread> {
  const now = input.now ?? Date.now();
  const thread = await upsertStoredProjectThread(
    ProjectThreadSchema.parse({
      bestSessionMode: "CREATIVE",
      blocker: null,
      currentObjective: input.currentObjective,
      handoffNote: null,
      id: threadId(input.userId, now),
      lastSessionSummary: null,
      lastTouched: now,
      nextMove: input.nextMove,
      openQuestions: [],
      projectTitle: input.projectTitle,
      rescuedAt: null,
      staleRisk: "none",
      state: "new",
      userId: input.userId,
    }),
  );
  trackProjectThreadCreated(thread.projectTitle);
  return thread;
}

export async function ensureProjectThread(input: {
  projectTitle: string;
  userId: string;
  now?: number;
}): Promise<ProjectThread> {
  const threads = await listStoredProjectThreads(input.userId);
  const now = input.now ?? Date.now();
  const active = threads.find((t) => t.state !== "completed");
  if (active) return refreshProjectThreadState(active, now);
  return createProjectThread({
    currentObjective: `Start ${input.projectTitle}`,
    nextMove: "Open your project",
    projectTitle: input.projectTitle,
    userId: input.userId,
    now,
  });
}

export function rescueStaleProject(
  thread: ProjectThread,
  now = Date.now(),
): ProjectThread {
  const rescued = ProjectThreadSchema.parse({
    ...thread,
    bestSessionMode: "LIGHT_FOCUS",
    lastTouched: now,
    rescuedAt: now,
    staleRisk: "none",
    state: "rescued",
  });
  trackProjectThreadRescued(thread.projectTitle);
  return rescued;
}

export function buildProjectSessionBrief(
  thread: ProjectThread,
  now = Date.now(),
): ProjectSessionBrief {
  const risk = staleRisk(thread.lastTouched, now);
  const isRescued = thread.state === "rescued";
  return ProjectSessionBriefSchema.parse({
    durationSeconds: isRescued ? 10 * 60 : risk === "high" ? 15 * 60 : 25 * 60,
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
    state: ProjectThread["state"];
  };
  type: "project_handoff";
};

export function buildProjectMemoryCandidate(
  thread: ProjectThread,
): ProjectMemoryCandidate {
  trackProjectHandoffStored(thread.projectTitle);
  return {
    content: [
      thread.handoffNote && `Handoff: ${thread.handoffNote}`,
      `Last summary: ${thread.lastSessionSummary ?? "N/A"}`,
      `Next move: ${thread.nextMove}`,
      thread.blocker && `Blocker: ${thread.blocker}`,
    ]
      .filter(Boolean)
      .join("\n"),
    metadata: {
      projectTitle: thread.projectTitle,
      state: thread.state,
      threadId: thread.id,
    },
    type: "project_handoff",
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
  if (!thread) throw new Error("Project thread could not be found.");
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
      staleRisk: "none",
      state: input.blocker ? "blocked" : "active",
    }),
  );
  trackProjectThreadUpdated(updated.projectTitle, updated.state);
  return updated;
}

export function refreshProjectThreadState(
  thread: ProjectThread,
  now = Date.now(),
): ProjectThread {
  const risk = staleRisk(thread.lastTouched, now);
  return ProjectThreadSchema.parse({
    ...thread,
    staleRisk: risk,
    state:
      thread.state === "completed" ||
      thread.state === "blocked" ||
      thread.state === "rescued"
        ? thread.state
        : risk === "high" || risk === "medium"
          ? "stale"
          : thread.state,
  });
}

/** Deep/Creative lane = project surface. Student/Game_like = hidden. */
export function shouldShowProjectSurface(
  lane: "student" | "game_like" | "deep_creative" | "minimal_normal",
): boolean {
  return lane === "deep_creative";
}

export function buildProjectHomeSurface(input: {
  lane: "student" | "game_like" | "deep_creative" | "minimal_normal";
  thread: ProjectThread | null;
}): ProjectHomeSurface {
  const visible = shouldShowProjectSurface(input.lane);
  const thread = input.thread ? refreshProjectThreadState(input.thread) : null;
  const isRescued = thread?.state === "rescued";
  const isStale = thread?.state === "stale";
  return ProjectHomeSurfaceSchema.parse({
    ctaLabel: thread ? "Resume project" : "Create project",
    hidden: !visible,
    recoveryPrompt: isRescued
      ? "Continue recovery session."
      : isStale
        ? "Re-enter with a short review block."
        : (thread?.blocker ?? null),
    title: isRescued
      ? `Recover ${thread?.projectTitle}`
      : isStale
        ? `Stale: ${thread?.projectTitle ?? "Project Thread"}`
        : (thread?.nextMove ?? "Project Thread"),
  });
}
