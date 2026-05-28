/**
 * Phase 3 — Shared test fixtures and helpers
 *
 * Extracted from phase3-lane-polish.test.ts for per-describe test files.
 * Fixtures live in phase3-test-fixtures.ts; this file re-exports everything.
 */

import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
} from "../lane-engine";
import type {
  Lane,
  LaneProfile,
  LaneMechanicPolicy,
} from "../lane-engine/types";
import { buildLaneSessionBrief } from "../session-start/service";
import { decideNudge } from "../notification-policy/service";
import type { NudgeDecision } from "../notification-policy/types";
import { isRescueEligible, createRescuePlan } from "../rescue-mode/service";
import { resolveCompletionExperiencePolicy } from "../session-completion/completion-experience-policy";
import type {
  CompletionExperiencePolicy,
  CompletionExperiencePolicyInput,
} from "../session-completion/completion-experience-policy-schemas";
import { resolveLaneCopy } from "../personalization/first-week-lane-copy";
import { LANE_USER_FACING_NAMES } from "../lane-engine/schemas";
import { decideHomeSurfaces } from "../home-experience/home-surface-decision";
import { SessionMode } from "../../session/modes";

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

export type { SessionModeString } from "./phase3-test-fixtures";

export {
  baseLaneProfile,
  featureAvailability,
  baseStats,
  baseProfile,
  sessionSummary,
  completionInput,
  auditLane,
} from "./phase3-test-fixtures";
