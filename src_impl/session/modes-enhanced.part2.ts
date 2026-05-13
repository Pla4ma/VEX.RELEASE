import { SessionMode, SessionModeConfig, SESSION_MODE_CONFIG } from "./modes";


export function getModeRecommendedDuration(mode: SessionMode): number {
  const durations: Partial<Record<SessionMode, number>> = {
    [SessionMode.FLOW]: 25,
    [SessionMode.CHALLENGE]: 90,
    [SessionMode.RECOVERY]: 15,
    [SessionMode.CREATIVE]: 60,
  };
  return durations[mode] ?? durations[SessionMode.FLOW]!;
}

export function getModeDifficultyRating(mode: SessionMode): 1 | 2 | 3 | 4 | 5 {
  const ratings: Partial<Record<SessionMode, 1 | 2 | 3 | 4 | 5>> = {
    [SessionMode.FLOW]: 1,
    [SessionMode.CREATIVE]: 2,
    [SessionMode.RECOVERY]: 1,
    [SessionMode.CHALLENGE]: 5,
  };
  return ratings[mode] ?? ratings[SessionMode.FLOW]!;
}

export const MODE_COMPATIBILITY_MATRIX: Partial<Record<SessionMode, {
  strongAgainst: SessionMode[];
  weakAgainst: SessionMode[];
  neutral: SessionMode[];
}>> = {
  [SessionMode.FLOW]: {
    strongAgainst: [SessionMode.CREATIVE],
    weakAgainst: [SessionMode.CHALLENGE],
    neutral: [SessionMode.FLOW, SessionMode.RECOVERY],
  },
  [SessionMode.CHALLENGE]: {
    strongAgainst: [SessionMode.FLOW, SessionMode.RECOVERY],
    weakAgainst: [SessionMode.CREATIVE],
    neutral: [SessionMode.CHALLENGE],
  },
  [SessionMode.RECOVERY]: {
    strongAgainst: [SessionMode.FLOW, SessionMode.CREATIVE],
    weakAgainst: [SessionMode.CHALLENGE],
    neutral: [SessionMode.RECOVERY],
  },
  [SessionMode.CREATIVE]: {
    strongAgainst: [SessionMode.CHALLENGE],
    weakAgainst: [SessionMode.FLOW],
    neutral: [SessionMode.CREATIVE, SessionMode.RECOVERY],
  },
};

export function getModeEffectivenessAgainst(
  attackerMode: SessionMode,
  defenderMode: SessionMode
): 'strong' | 'weak' | 'neutral' {
  const compat = MODE_COMPATIBILITY_MATRIX[attackerMode] ?? MODE_COMPATIBILITY_MATRIX[SessionMode.FLOW]!;
  if (compat.strongAgainst.includes(defenderMode)) {
    return 'strong';
  }
  if (compat.weakAgainst.includes(defenderMode)) {
    return 'weak';
  }
  return 'neutral';
}