import {
  RecommendationEvidenceSchema,
  type CoachMemory,
  type RecommendationEvidence,
} from './memory-schemas';

export function hashEvidence(evidence: string): string {
  let hash = 0;
  for (let i = 0; i < evidence.length; i++) {
    const ch = evidence.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return `ev-${Math.abs(hash).toString(36)}`;
}

export function buildColdStartEvidence(reason: 'cold_start' | 'insufficient_data' | 'user_override'): RecommendationEvidence {
  return RecommendationEvidenceSchema.parse({ fallbackReason: reason });
}

export function buildMemoryEvidence(memories: CoachMemory[]): RecommendationEvidence {
  if (memories.length === 0) {
    return buildColdStartEvidence('insufficient_data');
  }
  const avgConfidence = memories.reduce((sum, m) => {
    const conf = typeof m.metadata.confidence === 'number' ? m.metadata.confidence : 0.7;
    return sum + conf;
  }, 0) / memories.length;
  return RecommendationEvidenceSchema.parse({
    memoryIds: memories.map((m) => m.id),
    evidenceSummary: memories.map((m) => m.title).join('; '),
    confidence: Math.round(avgConfidence * 100) / 100,
    fallbackReason: undefined,
  });
}

export function generateRecommendationEvidence(
  memories: CoachMemory[],
  sessionCount: number,
  fallbackReason?: 'cold_start' | 'insufficient_data' | 'user_override',
): RecommendationEvidence {
  if (sessionCount < 3) {
    return buildColdStartEvidence('cold_start');
  }
  if (fallbackReason) {
    return buildColdStartEvidence(fallbackReason);
  }
  return buildMemoryEvidence(memories);
}

export function canClaimStrongPattern(sessionCount: number): boolean {
  return sessionCount >= 3;
}
