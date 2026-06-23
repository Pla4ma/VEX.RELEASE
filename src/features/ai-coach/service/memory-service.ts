import { eventBus } from '../../../events/EventBus';
import {
  CreateCoachMemoryInputSchema,
  type CoachMemory,
  type CreateCoachMemoryInput,
  type MemoryType,
} from '../memory/memory-schemas';
import {
  StoreCoachMemoryEmbeddingInputSchema,
  SemanticCoachMemorySearchInputSchema,
  type MatchedCoachMemory,
  type SemanticCoachMemorySearchInput,
  type StoreCoachMemoryEmbeddingInput,
} from '../memory/vector-memory-schemas';
import * as repository from '../repository/memories';
import { createCoachMemoryCreatedEvent } from '../memory/memory-events';
import { trackMemoryCreated, trackMemoryError } from '../memory/memory-analytics';

export async function createCoachMemory(
  input: CreateCoachMemoryInput,
): Promise<CoachMemory> {
  const parsed = CreateCoachMemoryInputSchema.parse(input);

  try {
    const memory = await repository.createMemory(
      parsed.userId,
      parsed.type,
      parsed.title,
      parsed.description,
      parsed.metadata,
      parsed.evidenceHash,
    );
    trackMemoryCreated(memory);
    eventBus.publish(
      'coach:memory_created',
      createCoachMemoryCreatedEvent(memory),
    );
    return memory;
  } catch (error: unknown) {
    trackMemoryError('memory-create', error, parsed.userId);
    throw error;
  }
}

export async function storeCoachMemoryEmbedding(
  input: StoreCoachMemoryEmbeddingInput,
): Promise<void> {
  const parsed = StoreCoachMemoryEmbeddingInputSchema.parse(input);

  try {
    await repository.storeMemoryEmbedding(parsed);
  } catch (error: unknown) {
    trackMemoryError('memory-embedding-store', error, parsed.userId);
    throw error;
  }
}

export async function searchCoachMemoriesByEmbedding(
  input: SemanticCoachMemorySearchInput,
): Promise<MatchedCoachMemory[]> {
  const parsed = SemanticCoachMemorySearchInputSchema.parse(input);

  try {
    return repository.matchCoachMemories(parsed);
  } catch (error: unknown) {
    trackMemoryError('memory-semantic-search', error, parsed.userId);
    throw error;
  }
}

export async function fetchCoachMemories(
  userId: string,
  type?: MemoryType,
): Promise<CoachMemory[]> {
  try {
    return type
      ? repository.getMemoriesByType(userId, type)
      : repository.getMemoriesByUser(userId);
  } catch (error: unknown) {
    trackMemoryError('memory-fetch', error, userId);
    throw error;
  }
}

export async function markCoachMemoryReferenced(
  memoryId: string,
): Promise<void> {
  try {
    await repository.markMemoryReferenced(memoryId);
  } catch (error: unknown) {
    trackMemoryError('memory-reference', error);
    throw error;
  }
}
