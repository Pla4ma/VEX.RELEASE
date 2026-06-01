import { type ProjectThread } from './schemas';
import { buildProjectMemoryCandidate } from './service';
import { trackProjectHandoffStored } from './analytics';

export interface ProjectMemoryHandoff {
  content: string;
  projectTitle: string;
  state: string;
  threadId: string;
  type: 'project_handoff';
}

export function buildProjectHandoffForMemory(
  thread: ProjectThread,
): ProjectMemoryHandoff {
  const candidate = buildProjectMemoryCandidate(thread);
  return {
    content: candidate.content,
    projectTitle: candidate.metadata.projectTitle,
    state: candidate.metadata.state,
    threadId: candidate.metadata.threadId,
    type: candidate.type,
  };
}

export function shouldExportProjectMemory(thread: ProjectThread): boolean {
  return (
    thread.state === 'active' ||
    thread.state === 'blocked' ||
    thread.state === 'completed'
  );
}
