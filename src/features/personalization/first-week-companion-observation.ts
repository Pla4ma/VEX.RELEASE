import type { Lane } from "../lane-engine/types";
import type { SessionProfile } from "./first-week-schemas";

export interface CompanionObservation {
  observation: string;
  confidence: "high" | "medium" | "low";
  isEditable: boolean;
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
        confidence: "high",
        isEditable: true,
      };
    }
    if (consistencyScore >= 0.4) {
      return {
        observation: `You complete study blocks at roughly ${averageDurationMinutes} minutes. VEX will suggest blocks at this length.`,
        confidence: "medium",
        isEditable: true,
      };
    }
    if (preferredStartHour !== null) {
      return {
        observation: `You tend to start studying around ${preferredStartHour}:00. VEX will align reminders to this window.`,
        confidence: "medium",
        isEditable: true,
      };
    }
    if (abandonments > completions) {
      return {
        observation: "VEX noticed some sessions ended early — starting with shorter, named blocks may help increase completion.",
        confidence: "medium",
        isEditable: true,
      };
    }
    return {
      observation: "VEX is still learning your rhythm. Complete one more session to make this sharper.",
      confidence: "low",
      isEditable: false,
    };
  }

  if (lane === "game_like") {
    if (completions > abandonments && longestStreak >= 2) {
      return {
        observation: `You finish more encounters than you leave — ${completions} completed vs ${abandonments} abandoned.`,
        confidence: "high",
        isEditable: true,
      };
    }
    if (averageDurationMinutes >= 45) {
      return {
        observation: `Your average encounter runs ${averageDurationMinutes} minutes — longer than most first-week users. VEX will suggest one shorter encounter to test.`,
        confidence: "high",
        isEditable: true,
      };
    }
    if (abandonments > completions) {
      return {
        observation: "You have more unfinished encounters than finished ones. A 10-minute warmup run before committing may help.",
        confidence: "medium",
        isEditable: true,
      };
    }
    return {
      observation: "VEX is still learning your encounter rhythm. Complete one more run to make this sharper.",
      confidence: "low",
      isEditable: false,
    };
  }

  if (lane === "deep_creative") {
    if (profile.savedNextMoves > 0) {
      return {
        observation: `You have saved ${profile.savedNextMoves} next moves across your project blocks. VEX preserves that thread.`,
        confidence: "high",
        isEditable: true,
      };
    }
    if (consistencyScore >= 0.6) {
      return {
        observation: `Your creative flow shows ${completions} completed project blocks with steady rhythm. Saving next moves at completion would strengthen continuity.`,
        confidence: "medium",
        isEditable: true,
      };
    }
    if (averageDurationMinutes < 15) {
      return {
        observation: `Your project blocks tend to be short (~${averageDurationMinutes} min). VEX suggests protecting one slightly longer block this week.`,
        confidence: "medium",
        isEditable: true,
      };
    }
    return {
      observation: "VEX is still learning your creative cadence. Complete one more project block to make this sharper.",
      confidence: "low",
      isEditable: false,
    };
  }

  if (preferredStartHour !== null) {
    return {
      observation: `Your sessions tend to start around ${preferredStartHour}:00. VEX keeps it quiet and out of the way.`,
      confidence: "high",
      isEditable: true,
    };
  }
  if (consistencyScore >= 0.8) {
    return {
      observation: `Your rhythm is unusually steady — ${completions} sessions with very little variation.`,
      confidence: "high",
      isEditable: true,
    };
  }
  if (consistencyScore >= 0.4) {
    return {
      observation: `${completions} clean sessions done. Average ${averageDurationMinutes} minutes — VEX learns your tempo.`,
      confidence: "medium",
      isEditable: true,
    };
  }
  return {
    observation: "VEX is still learning your rhythm. Complete one more session to make this sharper.",
    confidence: "low",
    isEditable: false,
  };
}
