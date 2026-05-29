import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Lane } from "../lane-engine/types";
import {
  deriveHomeSurface,
  deriveQuickContract,
  deriveActiveIndicator,
  deriveRescueSurface,
} from "./service";
import type { HomeContext } from "./service";
import {
  deriveCompletionSurface,
  deriveWeeklyIntelligence,
} from "./service-surface";
import type {
  CompletionContext,
  WeeklyIntelligenceContext,
} from "./service-surface";
import type {
  ModeHomeSurface,
  ModeQuickContract,
  ModeActiveIndicator,
  ModeCompletionSurface,
  ModeRescueSurface,
  ModeWeeklyIntelligence,
} from "./schemas";

// ── Mode Home Hook ─────────────────────────────────────────────────────

export function useModeHomeSurface(
  context: HomeContext,
): ModeHomeSurface {
  return useMemo(() => deriveHomeSurface(context), [
    context.laneOverride,
    context.hasActiveProject,
    context.projectTitle,
    context.nextMove,
    context.recentTopic,
  ]);
}

// ── Quick Contract Hook ────────────────────────────────────────────────

export function useModeQuickContract(
  laneOverride: Lane | null | undefined,
): ModeQuickContract {
  return useMemo(() => deriveQuickContract(laneOverride), [laneOverride]);
}

// ── Active Indicator Hook ──────────────────────────────────────────────

export function useModeActiveIndicator(
  laneOverride: Lane | null | undefined,
): ModeActiveIndicator {
  return useMemo(() => deriveActiveIndicator(laneOverride), [laneOverride]);
}

// ── Completion Surface Hook ────────────────────────────────────────────

export function useModeCompletion(
  context: CompletionContext,
): ModeCompletionSurface {
  return useMemo(
    () => deriveCompletionSurface(context),
    [context.laneOverride, context.topic, context.task, context.project, context.action],
  );
}

// ── Rescue Surface Hook ────────────────────────────────────────────────

export function useModeRescueSurface(
  laneOverride: Lane | null | undefined,
): ModeRescueSurface {
  return useMemo(() => deriveRescueSurface(laneOverride), [laneOverride]);
}

// ── Weekly Intelligence Hook ───────────────────────────────────────────

const WEEKLY_INTELLIGENCE_KEY = "mode-native-weekly-intelligence";

export function useModeWeeklyIntelligence(
  userId: string | null | undefined,
  context: WeeklyIntelligenceContext,
) {
  return useQuery<ModeWeeklyIntelligence>({
    queryKey: [WEEKLY_INTELLIGENCE_KEY, userId, context.laneOverride],
    queryFn: () => deriveWeeklyIntelligence(context),
    enabled: Boolean(userId) && Boolean(context.laneOverride),
    staleTime: 1000 * 60 * 5,
  });
}
