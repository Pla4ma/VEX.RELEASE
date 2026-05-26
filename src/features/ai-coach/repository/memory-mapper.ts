import {
  CoachMemoryRowSchema,
  CoachMemorySchema,
  type CoachMemory,
  type CoachMemoryRow,
  type CreateCoachMemoryInput,
} from '../memory-schemas';
import { v4 } from '../../../utils/uuid';

export type NewCoachMemoryRow = Omit<
  CoachMemoryRow,
  'created_at' | 'updated_at'
>;

export function mapRowToMemory(row: unknown): CoachMemory {
  const parsed = CoachMemoryRowSchema.parse(row);
  return CoachMemorySchema.parse({
    id: parsed.id,
    userId: parsed.user_id,
    type: parsed.type,
    title: parsed.title,
    description: parsed.description,
    occurredAt: new Date(parsed.occurred_at).getTime(),
    metadata: parsed.metadata,
    referencedCount: parsed.referenced_count,
    lastReferencedAt: parsed.last_referenced_at
      ? new Date(parsed.last_referenced_at).getTime()
      : null,
    deletedAt: parsed.deleted_at ? new Date(parsed.deleted_at).getTime() : null,
    evidenceHash: parsed.evidence_hash,
  });
}

export function mapInputToRow(input: CreateCoachMemoryInput): NewCoachMemoryRow {
  return {
    id: v4(),
    user_id: input.userId,
    type: input.type,
    title: input.title,
    description: input.description,
    occurred_at: new Date().toISOString(),
    metadata: input.metadata,
    referenced_count: 0,
    last_referenced_at: null,
    deleted_at: null,
    evidence_hash: input.evidenceHash,
  };
}
