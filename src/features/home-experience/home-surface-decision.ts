import type {
  HomeSurfaceKey,
  HomeSurfaceMap,
} from "./surface-decision-schemas";
import {
  HomeSurfaceMapSchema,
  SurfaceDecisionInputSchema,
} from "./surface-decision-schemas";
import { enforceDay0SurfacePolicy } from "./day0-surface-policy";
import {
  createEmptyHomeSurfaceMap,
  selectSpotlight,
  setupDay0Surfaces,
} from "./surface-helpers";
import { applyLaneSurfaces } from "./lane-surface-helpers";
import { applyPostPlacementRules } from "./surface-decision-rules";
import type { z } from "zod";

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;

export function decideHomeSurfaces(
  input: SurfaceDecisionInput,
): HomeSurfaceMap {
  const parsed = SurfaceDecisionInputSchema.parse(input);
  const { personalizationProfile: p, behaviorStats: b } = parsed;
  const isDayZero = b.totalCompletedSessions === 0;
  const isNew = b.totalCompletedSessions < 3;
  const isEngaged = b.totalCompletedSessions >= 3;

  const fwProvided = parsed.firstWeekPhase !== undefined;
  const fw = parsed.firstWeekPhase ?? {};
  const fwAllowedSurfaces = (fw.allowedHomeSurfaces ?? []) as string[];
  const fwPremiumMoment = fw.premiumMoment ?? "none";
  const fwBossIntensity = fw.bossIntensity ?? "hidden";

  if (fwProvided && fw.studyLayerLabel && parsed.featureAvailability.study) {
    p.studyLayerName = fw.studyLayerLabel;
  }

  if (isDayZero) {
    const raw = setupDay0Surfaces(parsed, p, b, fwProvided, fw);
    const { corrected } = enforceDay0SurfacePolicy(raw);
    return HomeSurfaceMapSchema.parse(corrected);
  }

  const map = createEmptyHomeSurfaceMap();

  map.coach_presence = b.coachInteractions > 0 ? "secondary" : "tiny_tease";
  map.progress_proof = "secondary";
  map.focus_score = isNew ? "tiny_tease" : "secondary";
  map.memory_insight = b.totalCompletedSessions >= 3 ? "secondary" : "hidden";
  if (!isNew) {
    map.progress_detail = isEngaged ? "secondary" : "secondary";
  }
  map.unlock_strip = isNew ? "secondary" : "hidden";
  applyLaneSurfaces(map, parsed, p, b, isNew, isEngaged);
  selectSpotlight(map, parsed, p, b, isNew, isEngaged, fwProvided, fw);

  applyPostPlacementRules(
    map,
    parsed,
    p,
    b,
    isNew,
    isEngaged,
    fwProvided,
    fwAllowedSurfaces,
    fwPremiumMoment,
    fwBossIntensity,
  );

  return HomeSurfaceMapSchema.parse(map);
}

export function getPrimarySurface(map: HomeSurfaceMap): HomeSurfaceKey | null {
  const primary = Object.entries(map).find(([, v]) => v === "primary");
  return primary ? (primary[0] as HomeSurfaceKey) : null;
}

export function getSpotlightSurface(
  map: HomeSurfaceMap,
): HomeSurfaceKey | null {
  const spot = Object.entries(map).find(([, v]) => v === "spotlight");
  return spot ? (spot[0] as HomeSurfaceKey) : null;
}
