import { v4 } from '../../utils/uuid';
import { expiryForType, isSensitiveMemory, contentScopeForSource } from './expiry';
import { readMemories, writeMemories } from './repository';
import {
  ColdStartReasonSchema,
  CreateMemoryCandidateInputSchema,
  FocusMemorySchema,
  MemoryRecommendationInputSchema,
  RecommendationEvidenceSchema,
  type ColdStartReason,
  type CreateMemoryCandidateInput,
  type FocusMemory,
  type MemoryRecommendationInput,
  type RecommendationEvidence,
} from './schemas';

function isActive(memory: FocusMemory, now: number): boolean {
  if (memory.deletedAt !== null) return false;
  return memory.expiresAt === null || memory.expiresAt > now;
}

function shouldAutoAccept(input: CreateMemoryCandidateInput): boolean {
  return input.confidence >= 0.7 && !isSensitiveMemory(input.type);
}

export function hashEvidence(evidence: string): string {
  let hash = 0;
  for (let i = 0; i < evidence.length; i++) {
    const ch = evidence.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return `ev-${Math.abs(hash).toString(36)}`;
}

export async function hasEvidenceConflict(userId: string, evidenceHash: string): Promise<boolean> {
  if (!evidenceHash) return false;
  const all = await readMemories(userId);
  return all.some(
    (m) => m.evidenceHash === evidenceHash && m.deletedAt !== null
  );
}

export async function createMemoryCandidate(rawInput: CreateMemoryCandidateInput): Promise<FocusMemory> {
  const input = CreateMemoryCandidateInputSchema.parse(rawInput);
  const createdAt = input.createdAt ?? Date.now();

  if (input.evidenceHash) {
    const conflict = await hasEvidenceConflict(input.userId, input.evidenceHash);
    if (conflict) {
      throw new Error('EvidenceConflict: memory with this evidence was previously deleted');
    }
  }

  const memory = FocusMemorySchema.parse({
    id: v4(),
    userId: input.userId,
    type: input.type,
    summary: input.summary,
    source: input.source,
    confidence: input.confidence,
    accepted: shouldAutoAccept(input),
    deletedAt: null,
    expiresAt: expiryForType(input.type, createdAt),
    evidenceHash: input.evidenceHash ?? null,
    createdAt,
    updatedAt: createdAt,
  });
  const memories = await readMemories(input.userId);
  await writeMemories(input.userId, [memory, ...memories]);
  return memory;
}

export async function acceptMemory(memoryId: string, userId: string): Promise<FocusMemory> {
  const memories = await readMemories(userId);
  const updated = memories.map((memory) => (
    memory.id === memoryId
      ? FocusMemorySchema.parse({ ...memory, accepted: true, updatedAt: Date.now() })
      : memory
  ));
  await writeMemories(userId, updated);
  const found = updated.find((memory) => memory.id === memoryId);
  if (!found) throw new Error('Memory not found');
  return found;
}

export async function deleteMemory(memoryId: string, userId: string): Promise<void> {
  const memories = await readMemories(userId);
  const updated = memories.map((memory) => (
    memory.id === memoryId
      ? FocusMemorySchema.parse({ ...memory, deletedAt: Date.now(), updatedAt: Date.now() })
      : memory
  ));
  await writeMemories(userId, updated);
}

export async function listActiveMemories(userId: string): Promise<FocusMemory[]> {
  const now = Date.now();
  return (await readMemories(userId)).filter((memory) => isActive(memory, now));
}

export async function listDeletedMemoryHashes(userId: string): Promise<string[]> {
  const all = await readMemories(userId);
  return all
    .filter((m) => m.deletedAt !== null && m.evidenceHash !== null)
    .map((m) => m.evidenceHash as string);
}

export async function findMemoriesForRecommendation(rawInput: MemoryRecommendationInput): Promise<FocusMemory[]> {
  const input = MemoryRecommendationInputSchema.parse(rawInput);
  const now = input.now ?? Date.now();
  return (await readMemories(input.userId)).filter((memory) => {
    const typeAllowed = input.types ? input.types.includes(memory.type) : true;
    return typeAllowed && memory.accepted && memory.confidence >= input.minConfidence && isActive(memory, now);
  });
}

export function buildColdStartEvidence(
  reason: ColdStartReason,
  lane?: string,
): RecommendationEvidence {
  const validated = ColdStartReasonSchema.parse(reason);
  return RecommendationEvidenceSchema.parse({
    fallbackReason: validated,
    source: 'cold_start',
    lane: lane ?? 'minimal_normal',
  });
}

export function buildMemoryEvidence(
  memories: FocusMemory[],
  lane?: string,
): RecommendationEvidence {
  if (memories.length === 0) {
    return buildColdStartEvidence('insufficient_data', lane);
  }
  const avgConfidence = memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
  return RecommendationEvidenceSchema.parse({
    memoryIds: memories.map((m) => m.id),
    evidenceSummary: memories.map((m) => m.summary).join('; '),
    confidence: Math.round(avgConfidence * 100) / 100,
    fallbackReason: undefined,
    source: 'behavior',
    lane: lane ?? 'minimal_normal',
  });
}

export function generateRecommendationEvidence(
  memories: FocusMemory[],
  sessionCount: number,
  lane?: string,
  fallbackReason?: ColdStartReason,
): RecommendationEvidence {
  const resolvedLane = lane ?? 'minimal_normal';
  if (sessionCount < 3) {
    return buildColdStartEvidence('cold_start', resolvedLane);
  }
  if (fallbackReason) {
    return buildColdStartEvidence(fallbackReason, resolvedLane);
  }
  return buildMemoryEvidence(memories, resolvedLane);
}

export function canClaimStrongPattern(sessionCount: number): boolean {
  return sessionCount >= 3;
}

export function scopeMessageForSource(
  message: string,
  source: FocusMemory['source'],
): { message: string; scoped: boolean } {
  if (source === 'import') {
    return {
      message: `[From your content] ${message}`,
      scoped: true,
    };
  }
  return { message, scoped: false };
}

export function isImportSourceMemory(memory: FocusMemory): boolean {
  return memory.source === 'import';
}

export function filterImportMemories(memories: FocusMemory[]): {
  taskScoped: FocusMemory[];
  excluded: FocusMemory[];
} {
  const taskScoped: FocusMemory[] = [];
  const excluded: FocusMemory[] = [];
  for (const memory of memories) {
    if (contentScopeForSource(memory.source) === 'task_only') {
      excluded.push(memory);
    } else {
      taskScoped.push(memory);
    }
  }
  return { taskScoped, excluded };
}
