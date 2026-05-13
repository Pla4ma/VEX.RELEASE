import { z } from "zod";
import * as Sentry from "@sentry/react-native";
import { MMKV } from "react-native-mmkv";


export const bossCritService = new BossCriticalHitService();

export function isCritActive(sessionId: string): boolean {
  const state = bossCritService.getSessionState(sessionId);
  return state?.critStatus === CritStatus.ACTIVE;
}

export function getCritStatusText(sessionId: string): {
  showOverlay: boolean;
  statusText: string;
  icon: string;
} {
  const state = bossCritService.getSessionState(sessionId);

  if (!state || state.critStatus === CritStatus.NONE) {
    return {
      showOverlay: false,
      statusText: '',
      icon: '',
    };
  }

  if (state.critStatus === CritStatus.ACTIVE) {
    return {
      showOverlay: !state.hasShownOverlay,
      statusText: '⚡ CRITICAL HIT CHANCE ACTIVE!',
      icon: '⚡',
    };
  }

  if (state.critStatus === CritStatus.NEAR_MISS) {
    return {
      showOverlay: false,
      statusText: 'Almost a critical hit!',
      icon: '💫',
    };
  }

  return {
    showOverlay: false,
    statusText: '',
    icon: '',
  };
}