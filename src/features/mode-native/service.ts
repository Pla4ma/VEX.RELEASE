import { LaneSchema } from '../lane-engine/schemas';
import type { Lane } from '../lane-engine/types';
import {
  QUICK_CONTRACT_COPY,
  ACTIVE_INDICATOR_COPY,
  RESCUE_COPY,
  EVIDENCE_HOME_COPY,
  COLD_START_HOME_COPY,
} from './copy';
import {
  ModeHomeSurfaceSchema,
  ModeQuickContractSchema,
  ModeActiveIndicatorSchema,
  ModeRescueSurfaceSchema,
} from './schemas';
import type {
  ModeHomeSurface,
  ModeQuickContract,
  ModeActiveIndicator,
  ModeRescueSurface,
} from './schemas';

// ── Helpers ────────────────────────────────────────────────────────────

function resolveLane(raw: unknown): Lane {
  const parsed = LaneSchema.safeParse(raw);
  return parsed.success ? parsed.data : 'minimal_normal';
}

// ── Home context ───────────────────────────────────────────────────────

export interface HomeContext {
  laneOverride?: Lane | null;
  hasActiveProject?: boolean;
  projectTitle?: string;
  nextMove?: string;
  recentTopic?: string;
  weakTopicCount?: number;
  cleanStartsThisWeek?: number;
  /** Number of completed sessions — used to decide cold-start vs evidence-backed */
  completedSessions?: number;
}

export function deriveHomeSurface(context: HomeContext): ModeHomeSurface {
  const lane = context.laneOverride
    ? resolveLane(context.laneOverride)
    : 'minimal_normal';

  const hasEvidence = (context.completedSessions ?? 0) >= 3;
  const base = hasEvidence
    ? EVIDENCE_HOME_COPY[lane]
    : COLD_START_HOME_COPY[lane];

  let body = base.body;

  // Only apply evidence-backed enrichment when evidence exists
  if (hasEvidence) {
    if (
      lane === 'deep_creative' &&
      context.hasActiveProject &&
      context.nextMove
    ) {
      body = `Next move: ${context.nextMove}. Pick up where you stopped.`;
    }
    if (
      lane === 'student' &&
      context.recentTopic &&
      context.weakTopicCount !== undefined &&
      context.weakTopicCount > 0
    ) {
      body = `Review "${context.recentTopic}" — ${context.weakTopicCount} topic${context.weakTopicCount === 1 ? '' : 's'} need${context.weakTopicCount === 1 ? 's' : ''} attention. ${base.suggestedDurationMinutes} minutes.`;
    } else if (lane === 'student' && context.recentTopic) {
      body = `Your next study block: "${context.recentTopic}" for ${base.suggestedDurationMinutes} minutes.`;
    }
    if (
      lane === 'game_like' &&
      context.cleanStartsThisWeek !== undefined &&
      context.cleanStartsThisWeek > 0
    ) {
      body = `${context.cleanStartsThisWeek} clean start${context.cleanStartsThisWeek === 1 ? '' : 's'} this week. Keep the momentum going.`;
    }
  }

  return ModeHomeSurfaceSchema.parse({ ...base, lane, body });
}

// ── Quick Contract ─────────────────────────────────────────────────────

export function deriveQuickContract(
  laneOverride: unknown,
): ModeQuickContract {
  const lane = resolveLane(laneOverride);
  const base = QUICK_CONTRACT_COPY[lane];
  return ModeQuickContractSchema.parse({ ...base, lane });
}

// ── Active Indicator ───────────────────────────────────────────────────

export function deriveActiveIndicator(
  laneOverride: unknown,
): ModeActiveIndicator {
  const lane = resolveLane(laneOverride);
  const base = ACTIVE_INDICATOR_COPY[lane];
  return ModeActiveIndicatorSchema.parse({ ...base, lane });
}

// ── Rescue Surface ─────────────────────────────────────────────────────

export function deriveRescueSurface(
  laneOverride: unknown,
): ModeRescueSurface {
  const lane = resolveLane(laneOverride);
  const base = RESCUE_COPY[lane];
  return ModeRescueSurfaceSchema.parse({ ...base, lane });
}
