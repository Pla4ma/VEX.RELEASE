import {
  CoachMemoryRowSchema,
  CreateCoachMemoryInputSchema,
} from '../memory-schemas';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const memoryId = '123e4567-e89b-12d3-a456-426614174001';

describe('coach memory schemas', () => {
  it('validates a Supabase memory row', () => {
    expect(() =>
      CoachMemoryRowSchema.parse({
        id: memoryId,
        user_id: userId,
        type: 'STUDY_PATTERN',
        title: 'Evening focus',
        description: 'Strong sessions after 8 PM',
        occurred_at: '2026-05-05T20:00:00.000Z',
        metadata: { confidence: 0.8 },
        referenced_count: 0,
        last_referenced_at: null,
        created_at: '2026-05-05T20:00:00.000Z',
        updated_at: '2026-05-05T20:00:00.000Z',
      }),
    ).not.toThrow();
  });

  it('rejects a missing required row field', () => {
    expect(() =>
      CoachMemoryRowSchema.parse({
        id: memoryId,
        user_id: userId,
        type: 'STUDY_PATTERN',
        title: 'Evening focus',
      }),
    ).toThrow();
  });

  it('rejects invalid memory input type', () => {
    expect(() =>
      CreateCoachMemoryInputSchema.parse({
        userId,
        type: 'UNTRACKED_PATTERN',
        title: 'Invalid',
        description: 'Invalid',
      }),
    ).toThrow();
  });
});
