import {
  searchCoachMemoriesByEmbedding,
  storeCoachMemoryEmbedding,
} from '../service/memory-service';
import * as repository from '../repository/memories';
import { COACH_MEMORY_EMBEDDING_DIMENSIONS } from '../memory/vector-memory-schemas';

jest.mock('../repository/memories', () => ({
  storeMemoryEmbedding: jest.fn(),
  matchCoachMemories: jest.fn(),
}));

const userId = '123e4567-e89b-12d3-a456-426614174000';
const memoryId = '123e4567-e89b-12d3-a456-426614174001';

function embedding(value: number): number[] {
  return Array.from(
    { length: COACH_MEMORY_EMBEDDING_DIMENSIONS },
    () => value,
  );
}

describe('memory vector service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates and stores a coach memory embedding', async () => {
    await storeCoachMemoryEmbedding({
      userId,
      memoryId,
      embedding: embedding(0.03),
      embeddingModel: 'text-embedding-3-small',
    });

    expect(repository.storeMemoryEmbedding).toHaveBeenCalledWith(
      expect.objectContaining({ userId, memoryId }),
    );
  });

  it('rejects invalid semantic search embeddings before repository access', async () => {
    await expect(
      searchCoachMemoriesByEmbedding({
        userId,
        queryEmbedding: [0.01],
      }),
    ).rejects.toThrow();

    expect(repository.matchCoachMemories).not.toHaveBeenCalled();
  });
});
