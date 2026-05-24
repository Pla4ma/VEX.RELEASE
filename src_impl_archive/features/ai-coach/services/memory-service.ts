import { eventBus } from '../../../events';
import {
  CreateCoachMemoryInputSchema,
  type CoachMemory,
  type CreateCoachMemoryInput,
  type MemoryType,
} from '../memory-schemas';
import * as repository from '../repository/memories';
import { createCoachMemoryCreatedEvent } from '../memory-events';
import { trackMemoryCreated, trackMemoryError } from '../memory-analytics';

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

export async function markCoachMemoryReferenced(memoryId: string): Promise<void> {
  try {
    await repository.markMemoryReferenced(memoryId);
  } catch (error: unknown) {
    trackMemoryError('memory-reference', error);
    throw error;
  }
}
