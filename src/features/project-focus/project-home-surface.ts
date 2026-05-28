import {
  ProjectHomeSurfaceSchema,
  type ProjectThread,
  type ProjectHomeSurface,
} from "./schemas";
import { refreshProjectThreadState } from "./project-thread-service";

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
