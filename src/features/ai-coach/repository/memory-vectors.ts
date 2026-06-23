import { supabase } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';
import { createDebugger } from '../../../utils/debug';
import { mapRowToMemory } from './memory-mapper';
import {
  MatchedCoachMemoryRowSchema,
  MatchedCoachMemorySchema,
  StoreCoachMemoryEmbeddingInputSchema,
  SemanticCoachMemorySearchInputSchema,
  type CoachMemoryEmbedding,
  type MatchedCoachMemory,
  type SemanticCoachMemorySearchInput,
  type StoreCoachMemoryEmbeddingInput,
} from '../memory/vector-memory-schemas';

const debug = createDebugger('ai-coach:memory-vectors');

export async function storeMemoryEmbedding(
  input: StoreCoachMemoryEmbeddingInput,
): Promise<void> {
  const parsed = StoreCoachMemoryEmbeddingInputSchema.parse(input);
  const { error } = await supabase
    .from('coach_memories')
    .update({
      embedding: toPgVectorLiteral(parsed.embedding),
      embedding_model: parsed.embeddingModel,
      embedded_at: new Date().toISOString(),
    })
    .eq('id', parsed.memoryId)
    .eq('user_id', parsed.userId)
    .is('deleted_at', null);

  if (error) {
    debug.error('Failed to store memory embedding:', error);
    throw new RepositoryError('storeMemoryEmbedding', error);
  }
}

export async function matchCoachMemories(
  input: SemanticCoachMemorySearchInput,
): Promise<MatchedCoachMemory[]> {
  const parsed = SemanticCoachMemorySearchInputSchema.parse(input);
  const { data, error } = await supabase.rpc('match_coach_memories', {
    query_embedding: toPgVectorLiteral(parsed.queryEmbedding),
    match_count: parsed.matchCount,
    match_threshold: parsed.matchThreshold,
  });

  if (error) {
    debug.error('Failed to match coach memories:', error);
    throw new RepositoryError('matchCoachMemories', error);
  }

  return (data ?? []).map(mapMatchedRowToMemory);
}

function mapMatchedRowToMemory(row: unknown): MatchedCoachMemory {
  const parsed = MatchedCoachMemoryRowSchema.parse(row);
  return MatchedCoachMemorySchema.parse({
    ...mapRowToMemory(parsed),
    similarity: parsed.similarity,
  });
}

function toPgVectorLiteral(embedding: CoachMemoryEmbedding): string {
  return `[${embedding.map((value) => value.toString()).join(',')}]`;
}
