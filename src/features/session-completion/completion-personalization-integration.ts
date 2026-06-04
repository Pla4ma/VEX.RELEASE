import type { SessionSummary } from '../../session/types';
import type { CompletionPersonalizationResult } from './schemas';

export async function integrateCompletionPersonalization(_input: {
  deletedMemoryIds: string[];
  hiddenFeatureKeys?: string[];
  isComeback?: boolean;
  isPersonalBest?: boolean;
  laneProfile?: unknown;
  ledger?: unknown;
  sessionCount?: number;
  sessionId?: string;
  summary: SessionSummary;
  userId?: string;
}): Promise<CompletionPersonalizationResult | null> {
  return null;
}
