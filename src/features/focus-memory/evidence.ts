import { contentScopeForSource } from './expiry';
import {
  ColdStartReasonSchema,
  RecommendationEvidenceSchema,
  type ColdStartReason,
  type FocusMemory,
  type RecommendationEvidence,
} from './schemas';

export function hashEvidence(evidence: string): string {
  let hash = 0;
  for (let i = 0; i < evidence.length; i++) {
    const ch = evidence.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return `ev-${Math.abs(hash).toString(36)}`;
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
  const avgConfidence =
    memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
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
