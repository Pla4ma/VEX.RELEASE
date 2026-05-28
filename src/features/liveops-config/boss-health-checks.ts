import type { FeatureHealthCheck, FeatureHealthStatus } from "./feature-health";
import { DISABLED_FEATURES } from "./feature-access-config";

function bossFinalReleaseForbiddenDepsAreDisabled(): boolean {
  const disabled = new Set(DISABLED_FEATURES);
  return (
    disabled.has("squads") &&
    disabled.has("shop") &&
    disabled.has("economy_advanced")
  );
}

export const bossHealthChecks: FeatureHealthCheck[] = [
  {
    id: "boss_tab_template",
    feature: "boss_tab",
    label:
      "Boss Tab — template loading (infrastructure verified, runtime template verification pending)",
    dependency: "boss_template",
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return bossFinalReleaseForbiddenDepsAreDisabled()
        ? "healthy"
        : "unavailable";
    },
  },
  {
    id: "boss_tab_no_disabled_deps",
    feature: "boss_tab",
    label:
      "Boss Tab — final-release forbidden deps (squads/shop/economy) are disabled",
    dependency: "boss_dependencies",
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return bossFinalReleaseForbiddenDepsAreDisabled()
        ? "healthy"
        : "degraded";
    },
  },
  {
    id: "boss_tab_subtle_fallback",
    feature: "boss_tab",
    label:
      "Boss Tab — subtle mode fallback (infrastructure verified, runtime integration pending)",
    dependency: "boss_subtle",
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return bossFinalReleaseForbiddenDepsAreDisabled()
        ? "healthy"
        : "unavailable";
    },
  },
  {
    id: "boss_tab_route_gating",
    feature: "boss_tab",
    label:
      "Boss Tab — route/query/event subscription gating (infrastructure verified, runtime integration pending)",
    dependency: "boss_route_gating",
    cacheMs: 300_000,
    check: (): FeatureHealthStatus => {
      return bossFinalReleaseForbiddenDepsAreDisabled()
        ? "healthy"
        : "unavailable";
    },
  },
];
