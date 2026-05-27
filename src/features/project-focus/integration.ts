import { type ProjectThread } from "./schemas";
import {
  ensureProjectThread,
  rescueStaleProject,
  buildProjectSessionBrief,
  completeProjectSession,
  buildProjectMemoryCandidate,
} from "./service";
import {
  trackProjectThreadCreated,
  trackProjectSessionStarted,
  trackProjectThreadRescued,
} from "./analytics";

export interface ProjectFocusIntegration {
  ensureThread(userId: string, title: string): Promise<ProjectThread>;
  getSessionBrief(
    thread: ProjectThread,
  ): ReturnType<typeof buildProjectSessionBrief>;
  completeSession(params: {
    userId: string;
    threadId: string;
    summary: string;
    nextMove: string;
    handoffNote?: string;
    blocker?: string;
  }): Promise<ProjectThread>;
  handleStaleRescue(thread: ProjectThread): ProjectThread;
  buildHandoffForMemory(
    thread: ProjectThread,
  ): ReturnType<typeof buildProjectMemoryCandidate>;
}

export function createProjectFocusIntegration(): ProjectFocusIntegration {
  return {
    async ensureThread(userId, title) {
      const thread = await ensureProjectThread({ projectTitle: title, userId });
      trackProjectThreadCreated(title);
      return thread;
    },
    getSessionBrief(thread) {
      trackProjectSessionStarted(thread.projectTitle);
      return buildProjectSessionBrief(thread);
    },
    async completeSession(params) {
      return completeProjectSession({
        userId: params.userId,
        threadId: params.threadId,
        lastSessionSummary: params.summary,
        nextMove: params.nextMove,
        handoffNote: params.handoffNote ?? null,
        blocker: params.blocker ?? null,
      });
    },
    handleStaleRescue(thread) {
      const rescued = rescueStaleProject(thread);
      trackProjectThreadRescued(thread.projectTitle);
      return rescued;
    },
    buildHandoffForMemory(thread) {
      return buildProjectMemoryCandidate(thread);
    },
  };
}
