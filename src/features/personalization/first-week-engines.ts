import type { Lane } from "../lane-engine/types";
import type { SessionProfile } from "./first-week-schemas";

export interface CompanionObservation {
  observation: string;
}

export interface WeeklyRecommendation {
  headline: string;
  recommendation: string;
}

export interface DerivedPath {
  pathDescription: string;
}

export function deriveCompanionObservation(
  lane: Lane,
  profile: SessionProfile,
): CompanionObservation {
  const {
    averageDurationMinutes,
    completions,
    abandonments,
    consistencyScore,
    preferredStartHour,
    longestStreak,
  } = profile;

  if (lane === "student") {
    if (consistencyScore >= 0.7 && longestStreak >= 3) {
      return {
        observation: `Your study rhythm is consistent — ${completions} completed blocks averaging ${averageDurationMinutes} minutes.`,
      };
    }
    if (preferredStartHour !== null) {
      return {
        observation: `You tend to start studying around ${preferredStartHour}:00. VEX will align reminders to this window.`,
      };
    }
    return {
      observation: `${completions} study blocks completed so far. VEX notices you show up — that is enough signal to start.`,
    };
  }

  if (lane === "game_like") {
    if (completions > abandonments && longestStreak >= 2) {
      return {
        observation: `You finish more encounters than you leave — ${completions} completed vs ${abandonments} abandoned.`,
      };
    }
    if (averageDurationMinutes >= 45) {
      return {
        observation: `Your average encounter runs ${averageDurationMinutes} minutes — longer than most first-week users.`,
      };
    }
    return {
      observation: `${completions} encounters done. VEX sees your pace at ~${averageDurationMinutes} minutes per session.`,
    };
  }

  if (lane === "deep_creative") {
    if (profile.savedNextMoves > 0) {
      return {
        observation: `You have saved ${profile.savedNextMoves} next moves across your project blocks. VEX preserves that thread.`,
      };
    }
    if (consistencyScore >= 0.6) {
      return {
        observation: `Your creative flow shows ${completions} completed project blocks with steady rhythm.`,
      };
    }
    return {
      observation: `${completions} project blocks completed. VEX tracks continuity — next-move memory is building.`,
    };
  }

  if (preferredStartHour !== null) {
    return {
      observation: `Your sessions tend to start around ${preferredStartHour}:00. VEX keeps it quiet and out of the way.`,
    };
  }
  if (consistencyScore >= 0.8) {
    return {
      observation: `Your rhythm is unusually steady — ${completions} sessions with very little variation.`,
    };
  }
  return {
    observation: `${completions} clean sessions done. Average ${averageDurationMinutes} minutes — VEX learns your tempo.`,
  };
}

export function deriveWeeklyRecommendation(
  lane: Lane,
  profile: SessionProfile,
  bossEngagement: string,
  studyUsageRatio: number,
): WeeklyRecommendation {
  const {
    consistencyScore,
    averageDurationMinutes,
    longestStreak,
    abandonments,
  } = profile;

  if (lane === "student") {
    if (consistencyScore >= 0.7 && longestStreak >= 5) {
      return {
        headline: "Your study rhythm is solid. Here is the next step.",
        recommendation:
          "Increase session length from your average. Try adding 10 minutes of review at the end of each block.",
      };
    }
    if (studyUsageRatio >= 0.5) {
      return {
        headline: "You are using Study OS actively.",
        recommendation:
          "Try structuring sessions by topic — VEX can group your material if you tag your blocks.",
      };
    }
    if (consistencyScore < 0.4) {
      return {
        headline: "Your study pattern is still forming.",
        recommendation:
          "Aim for two study blocks this week at the same time each day. Consistency unlocks Study OS features.",
      };
    }
    return {
      headline: "Week one study data is in.",
      recommendation:
        "VEX recommends keeping study blocks under 50 minutes. Short, repeatable blocks build stronger memory.",
    };
  }

  if (lane === "game_like") {
    if (longestStreak >= 4 && bossEngagement === "high") {
      return {
        headline: "You are a streak builder.",
        recommendation:
          "Try running two shorter encounters instead of one long one. Streak stacking compounds faster.",
      };
    }
    if (abandonments >= 2) {
      return {
        headline: "Some encounters went unfinished.",
        recommendation:
          "Start with a 15-minute warmup encounter before committing to longer runs.",
      };
    }
    return {
      headline: "Your Run Board is forming.",
      recommendation:
        "Focus on completion rate this week. Finishing encounters unlocks modifiers that keep things fresh.",
    };
  }

  if (lane === "deep_creative") {
    if (profile.savedNextMoves >= 3) {
      return {
        headline: "You are protecting creative continuity.",
        recommendation:
          "Try a focused 90-minute project block with one saved next move at the end. Depth builds depth.",
      };
    }
    if (averageDurationMinutes < 30) {
      return {
        headline: "Your project blocks are short.",
        recommendation:
          "Try extending one session to 60 minutes this week. Creative flow needs time to deepen.",
      };
    }
    return {
      headline: "Your creative flow has a shape.",
      recommendation:
        "Protect one project block at the same time each day. Routine meets creativity when the container is reliable.",
    };
  }

  if (consistencyScore >= 0.85) {
    return {
      headline: "Your quiet rhythm is unusually consistent.",
      recommendation:
        "Keep doing what works. VEX suggests adding one focused-morning session this week if you want to experiment.",
    };
  }
  return {
    headline: "Seven clean sessions tell a story.",
    recommendation:
      "VEX noticed you finish what you start. No changes needed — just keep the container reliable.",
  };
}

export function deriveLanePath(
  lane: Lane,
  profile: SessionProfile,
  studyUsageRatio: number,
): DerivedPath {
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
