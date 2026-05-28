import {
  ProjectThreadSchema,
  type ProjectThread,
} from "./schemas";
import {
  listStoredProjectThreads,
  upsertStoredProjectThread,
} from "./repository";
import {
  trackProjectThreadCreated,
  trackProjectThreadUpdated,
  trackProjectThreadRescued,
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
