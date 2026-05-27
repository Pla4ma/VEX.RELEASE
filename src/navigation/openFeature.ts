import type { NavigationProp } from "@react-navigation/native";
import { getFeatureAvailabilityFor } from "../features/liveops-config/feature-availability";
import type {
  FeatureAccess,
  FeatureKey,
} from "../features/liveops-config/feature-access";
import { createDebugger } from "../utils/debug";
import * as Sentry from "@sentry/react-native";

const debug = createDebugger("navigation:openFeature");

export interface OpenFeatureResult {
  success: boolean;
  navigated: boolean;
  state: "hidden" | "teased" | "locked" | "unlocked" | "disabled" | "degraded";
  reason: string;
  fallbackTaken: boolean;
}

interface OpenFeatureOptions {
  fallbackRoute?: string;
  fallbackParams?: Record<string, unknown>;
  fallbackAction?: () => void;
}

export function openFeature(
  feature: FeatureKey,
  featureAccess: FeatureAccess,
  navigation:
    | NavigationProp<Record<string, object | undefined>>
    | null
    | undefined,
  targetRoute: string,
  targetParams?: Record<string, unknown>,
  options?: OpenFeatureOptions,
): OpenFeatureResult {
  const availability = getFeatureAvailabilityFor(feature, featureAccess);

  const base: Omit<OpenFeatureResult, "navigated" | "fallbackTaken"> = {
    success: false,
    state: availability.state,
    reason: availability.reason,
  };

  if (!availability.canNavigate || !availability.canRegisterRoute) {
    debug.warn(
      "Feature %s is %s: %s",
      feature,
      availability.state,
      availability.reason,
    );

    if (availability.state === "teased") {
      if (options?.fallbackAction) {
        options.fallbackAction();
        return { ...base, navigated: false, fallbackTaken: true };
      }
      return { ...base, navigated: false, fallbackTaken: false };
    }

    return { ...base, navigated: false, fallbackTaken: false };
  }

  if (!navigation) {
    debug.warn("Navigation not available for feature %s", feature);
    Sentry.captureMessage(
      `openFeature: navigation ref missing for ${feature}`,
      { level: "warning" },
    );
    return { ...base, navigated: false, fallbackTaken: false };
  }

  try {
    navigation.navigate(targetRoute, targetParams as object | undefined);
    return { ...base, success: true, navigated: true, fallbackTaken: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error(
      "Navigation to %s failed for feature %s: %s",
      targetRoute,
      feature,
      errorMessage,
    );
    Sentry.captureException(
      error instanceof Error ? error : new Error(errorMessage),
      {
        tags: { feature, targetRoute },
      },
    );

    if (options?.fallbackRoute && options.fallbackRoute !== targetRoute) {
      try {
        navigation.navigate(
          options.fallbackRoute,
          options.fallbackParams as object | undefined,
        );
        return { ...base, navigated: false, fallbackTaken: true };
      } catch (error: unknown) {
        return { ...base, navigated: false, fallbackTaken: false };
      }
    }

    return { ...base, navigated: false, fallbackTaken: false };
  }
}

export function resolveFeatureRoute(
  feature: FeatureKey,
  featureAccess: FeatureAccess,
): { canNavigate: boolean; state: string; reason: string } {
  const availability = getFeatureAvailabilityFor(feature, featureAccess);
  return {
    canNavigate: availability.canNavigate && availability.canRegisterRoute,
    state: availability.state,
    reason: availability.reason,
  };
}
