import {
  createMemoryCandidate,
  listMemoryCandidates,
  deleteMemoryCandidate,
} from "./repository";
import type { MemoryCandidate, MemoryCandidateInput } from "./schemas";

export async function addMemoryCandidate(input: {
  content: string;
  source: "study_block" | "recall" | "reflection" | "import";
  sourceId: string;
  tags?: string[];
  userId: string;
}): Promise<MemoryCandidate> {
  return createMemoryCandidate({ ...input, tags: input.tags ?? [] });
}

export async function getMemoryCandidates(
  userId: string,
): Promise<MemoryCandidate[]> {
  return listMemoryCandidates(userId);
}

export async function removeMemoryCandidate(
  userId: string,
  candidateId: string,
): Promise<void> {
  return deleteMemoryCandidate(userId, candidateId);
}

export async function addMemoryFromStudyBlock(input: {
  blockTitle: string;
  blockObjective: string;
  studyBlockId: string;
  tags?: string[];
  userId: string;
}): Promise<MemoryCandidate | null> {
  const content = `Study block: ${input.blockTitle} — ${input.blockObjective}`;
  return createMemoryCandidate({
    content: content.slice(0, 2000),
    source: "study_block",
    sourceId: input.studyBlockId,
    tags: input.tags ?? [],
    userId: input.userId,
  });
}

export async function addMemoryFromRecall(input: {
  prompt: string;
  answerHint: string | null;
  recallId: string;
  tags?: string[];
  userId: string;
}): Promise<MemoryCandidate | null> {
  const content = input.answerHint
    ? `Recall: ${input.prompt} (Hint: ${input.answerHint})`
    : `Recall: ${input.prompt}`;
  return createMemoryCandidate({
    content: content.slice(0, 2000),
    source: "recall",
    sourceId: input.recallId,
    tags: input.tags ?? [],
    userId: input.userId,
  });
}
