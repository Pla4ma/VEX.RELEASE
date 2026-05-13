import { z } from "zod";
import { featureFlags } from "../feature-flags/FeatureFlagEngine";


export function getModeSelectorOptionsV2(
  userLevel: number,
  hasCompletedTutorial: boolean,
  lastSessionFailed: boolean
): Array<{
  mode: SessionModeV2;
  config: SessionModeV2Config;
  eligible: boolean;
  reason?: string;
  recommended: boolean;
}> {
  const modes = [SessionModeV2.FLOW, SessionModeV2.CHALLENGE, SessionModeV2.RECOVERY];

  return modes.map((mode) => {
    const eligibility = isModeEligibleV2(mode, userLevel, hasCompletedTutorial);
    const recommended =
      (lastSessionFailed && mode === SessionModeV2.RECOVERY) ||
      (!lastSessionFailed && mode === SessionModeV2.FLOW);

    return {
      mode,
      config: SESSION_MODE_V2_CONFIG[mode],
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      recommended,
    };
  });
}

export function isConsolidatedModesEnabled(): boolean {
  return featureFlags.isEnabled('consolidated_session_modes');
}

export function getActiveModeConfig(mode: unknown): {
  name: string;
  description: string;
  xpMultiplier: number;
  allowPauses: boolean;
} {
  if (isConsolidatedModesEnabled()) {
    const v2Config = getSessionModeV2Config(mode);
    return {
      name: v2Config.name,
      description: v2Config.description,
      xpMultiplier: v2Config.xpMultiplier,
      allowPauses: v2Config.allowPauses,
    };
  }

  // Legacy fallback
  return {
    name: 'Standard',
    description: 'Focus session',
    xpMultiplier: 1.0,
    allowPauses: true,
  };
}