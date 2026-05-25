import { v4 } from '../../utils/uuid';
import { expiryForType, isSensitiveMemory } from './expiry';
import { readMemories, writeMemories } from './repository';
import {
  CreateMemoryCandidateInputSchema,
  FocusMemorySchema,
  MemoryRecommendationInputSchema,
  type CreateMemoryCandidateInput,
  type FocusMemory,
  type MemoryRecommendationInput,
} from './schemas';

function isActive(memory: FocusMemory, now: number): boolean {
  if (memory.deletedAt !== null) return false;
  return memory.expiresAt === null || memory.expiresAt > now;
}

function shouldAutoAccept(input: CreateMemoryCandidateInput): boolean {
  return input.confidence >= 0.7 && !isSensitiveMemory(input.type);
}

export async function createMemoryCandidate(rawInput: CreateMemoryCandidateInput): Promise<FocusMemory> {
  const input = CreateMemoryCandidateInputSchema.parse(rawInput);
  const createdAt = input.createdAt ?? Date.now();
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

export async function findMemoriesForRecommendation(rawInput: MemoryRecommendationInput): Promise<FocusMemory[]> {
  const input = MemoryRecommendationInputSchema.parse(rawInput);
  const now = input.now ?? Date.now();
  return (await readMemories(input.userId)).filter((memory) => {
    const typeAllowed = input.types ? input.types.includes(memory.type) : true;
    return typeAllowed && memory.accepted && memory.confidence >= input.minConfidence && isActive(memory, now);
  });
}
