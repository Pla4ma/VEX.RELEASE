import { storage } from '../../store/mmkv-storage';
import {
  MemoryCandidateSchema,
  MemoryCandidateListSchema,
  type MemoryCandidate,
  type MemoryCandidateInput,
} from './schemas';

const KEY_PREFIX = 'memory-candidate:';

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function listMemoryCandidates(
  userId: string,
): Promise<MemoryCandidate[]> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) {return [];}
  return MemoryCandidateListSchema.parse(JSON.parse(raw));
}

export async function createMemoryCandidate(
  input: MemoryCandidateInput,
): Promise<MemoryCandidate> {
  const candidate = MemoryCandidateSchema.parse({
    ...input,
    confidence: 'medium',
    createdAt: Date.now(),
    id: `mem:${input.userId}:${Date.now()}`,
  });
  const existing = await listMemoryCandidates(input.userId);
  const next = [candidate, ...existing].slice(0, 100);
  storage.set(keyFor(input.userId), JSON.stringify(next));
  return candidate;
}

export async function deleteMemoryCandidate(
  userId: string,
  candidateId: string,
): Promise<void> {
  const existing = await listMemoryCandidates(userId);
  const next = existing.filter((c) => c.id !== candidateId);
  storage.set(keyFor(userId), JSON.stringify(next));
}

export async function clearMemoryCandidates(userId: string): Promise<void> {
  storage.delete(keyFor(userId));
}
