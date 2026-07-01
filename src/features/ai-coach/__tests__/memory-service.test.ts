import { eventBus } from '../../../events';
import * as repository from '../repository/memories';
import { createCoachMemory } from '../service/memory-service';

jest.mock('../repository/memories');
jest.mock('../memory/memory-analytics', () => ({
  trackMemoryCreated: jest.fn(),
  trackMemoryError: jest.fn(),
}));

const userId = '123e4567-e89b-12d3-a456-426614174000';
const memoryId = '123e4567-e89b-12d3-a456-426614174001';

describe('memory-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    eventBus.clearHistory();
  });

  it('creates a memory and emits a memory event', async () => {
    jest.mocked(repository.createMemory).mockResolvedValue({
      id: memoryId,
      userId,
      type: 'STUDY_PATTERN',
      title: 'Evening focus',
      description: 'Strong sessions after 8 PM',
      occurredAt: 1778011200000,
      metadata: { confidence: 0.8 },
      referencedCount: 0,
      lastReferencedAt: null,
    });

    const memory = await createCoachMemory({
      userId,
      type: 'STUDY_PATTERN',
      title: 'Evening focus',
      description: 'Strong sessions after 8 PM',
      metadata: { confidence: 0.8 },
    });

    expect(memory.id).toBe(memoryId);
    expect(repository.createMemory).toHaveBeenCalledWith(
      userId,
      'STUDY_PATTERN',
      'Evening focus',
      'Strong sessions after 8 PM',
      { confidence: 0.8 },
      null,
    );
    expect(eventBus.getHistory()).toEqual([
      expect.objectContaining({
        event: 'coach:memory_created',
        data: expect.objectContaining({ memoryId, userId }),
      }),
    ]);
  });

  it('rejects invalid input before persistence', async () => {
    await expect(
      createCoachMemory({
        userId,
        type: 'STUDY_PATTERN',
        title: '',
        description: 'Missing title',
        metadata: {},
      }),
    ).rejects.toThrow();
    expect(repository.createMemory).not.toHaveBeenCalled();
  });
});
