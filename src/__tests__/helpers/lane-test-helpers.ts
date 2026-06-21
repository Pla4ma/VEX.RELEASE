/**
 * Phase 3 — Shared test fixtures and helpers
 *
 * Extracted from lane-polish.test.ts for per-describe test files.
 * Fixtures live in lane-test-fixtures.ts; this file re-exports everything.
 */

import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
} from '../../features/lane-engine';
import type {
  Lane,
  LaneProfile,
  LaneMechanicPolicy,
} from '../../features/lane-engine/types';
import { buildLaneSessionBrief } from '../../features/session-start/service';
import { decideNudge } from '../../features/notification-policy/service';
import type { NudgeDecision } from '../../features/notification-policy/types';
import { isRescueEligible, createRescuePlan } from '../../features/rescue-mode/service';
import { resolveCompletionExperiencePolicy } from '../../features/session-completion/completion-experience-policy';
import type {
  CompletionExperiencePolicy,
  CompletionExperiencePolicyInput,
} from '../../features/session-completion/completion-experience-policy-schemas';
import { resolveLaneCopy } from '../../features/personalization/first-week-lane-copy';
import { LANE_USER_FACING_NAMES } from '../../features/lane-engine/schemas';
import { decideHomeSurfaces } from '../../features/home-experience/home-surface-decision';
import { SessionMode } from '../../session/modes';

// ─── Re-exports for test files ─────────────────────────────────────────

export {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  buildLaneSessionBrief,
  decideNudge,
  isRescueEligible,
  createRescuePlan,
  resolveCompletionExperiencePolicy,
  resolveLaneCopy,
  LANE_USER_FACING_NAMES,
  decideHomeSurfaces,
  SessionMode,
};

export type {
  Lane,
  LaneProfile,
  LaneMechanicPolicy,
  NudgeDecision,
  CompletionExperiencePolicy,
  CompletionExperiencePolicyInput,
};

// ─── Fixture re-exports ────────────────────────────────────────────────

export type { SessionModeString } from './lane-test-fixtures';

export {
  baseLaneProfile,
  featureAvailability,
  baseStats,
  baseProfile,
  sessionSummary,
  completionInput,
  auditLane,
} from './lane-test-fixtures';
