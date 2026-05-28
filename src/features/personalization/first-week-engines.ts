export {
  deriveCompanionObservation,
  deriveWeeklyRecommendation,
  type CompanionObservation,
  type WeeklyRecommendation,
  type DerivedPath,
} from "./first-week-engines-observations";

import type { Lane } from "../lane-engine/types";
import type { SessionProfile } from "./first-week-schemas";

export function deriveLanePath(
  lane: Lane,
  profile: SessionProfile,
  studyUsageRatio: number,
): { pathDescription: string } {
  const { consistencyScore, longestStreak } = profile;

  if (lane === "student") {
    if (consistencyScore >= 0.6 && longestStreak >= 3) {
      return {
        pathDescription:
          "Study OS path is forming. VEX sees consistent study rhythm after the first week.",
      };
    }
    if (studyUsageRatio >= 0.4) {
      return {
        pathDescription:
          "Study OS path opens as your material usage grows across sessions.",
      };
    }
    return {
      pathDescription:
        "Study OS path opens after real study rhythm. One more consistent week and it unlocks fully.",
    };
  }

  if (lane === "game_like") {
    if (longestStreak >= 3) {
      return {
        pathDescription:
          "Run Board opens — VEX confirms you sustain encounters across sessions.",
      };
    }
    if (consistencyScore >= 0.5) {
      return {
        pathDescription:
          "Run Board path is forming. Complete a few more encounters to open it fully.",
      };
    }
    return {
      pathDescription:
        "Run Board opens after VEX sees enough completed encounters. Your streak is building.",
    };
  }

  if (lane === "deep_creative") {
    if (profile.savedNextMoves >= 2) {
      return {
        pathDescription:
          "Project Focus Path opens — VEX can preserve next moves across your creative blocks.",
      };
    }
    return {
      pathDescription:
        "Project Focus Path opens when VEX can preserve next moves. Save one at the end of each block to accelerate.",
    };
  }

  if (consistencyScore >= 0.7) {
    return {
      pathDescription:
        "Today Strip opens — VEX has enough rhythm data to stay useful while staying quiet.",
    };
  }
  return {
    pathDescription:
      "Today Strip opens when VEX has enough rhythm to stay useful and quiet. Your consistency is building.",
  };
}
