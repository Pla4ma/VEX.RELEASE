import * as Sentry from "@sentry/react-native";
import { eventBus } from "@/events";
import { HAPTIC_PATTERNS, SOUND_EFFECTS } from "./feedbackPatterns";

export interface FeedbackEvent {
  type:
    | "STREAK_INCREMENT"
    | "LEVEL_UP"
    | "BOSS_DEFEAT"
    | "BOSS_DAMAGE"
    | "REWARD_EARNED"
    | "SESSION_COMPLETE"
    | "SESSION_INTERRUPTED"
    | "PHASE_CHANGE"
    | "STREAK_WARNING"
    | "STREAK_BROKEN";
  intensity: "LOW" | "MEDIUM" | "HIGH";
  metadata?: {
    rarity?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
    amount?: number;
    isNewRecord?: boolean;
  };
}

export function triggerFeedback(event: FeedbackEvent): void {
  triggerHaptic(event);
  triggerSound(event);
  triggerVisual(event);
}

function triggerHaptic(event: FeedbackEvent): void {
  if (event.type === "REWARD_EARNED") {
    const rarity = event.metadata?.rarity ?? "COMMON";
    HAPTIC_PATTERNS[`REWARD_${rarity}`]();
    return;
  }

  switch (event.type) {
    case "STREAK_INCREMENT":
      HAPTIC_PATTERNS.STREAK_INCREMENT();
      return;
    case "LEVEL_UP":
      HAPTIC_PATTERNS.LEVEL_UP();
      return;
    case "BOSS_DEFEAT":
      HAPTIC_PATTERNS.BOSS_DEFEAT();
      return;
    case "SESSION_INTERRUPTED":
      HAPTIC_PATTERNS.SESSION_INTERRUPTED();
      return;
    case "PHASE_CHANGE":
      HAPTIC_PATTERNS.PHASE_CHANGE();
      return;
    case "STREAK_WARNING":
      HAPTIC_PATTERNS.STREAK_WARNING();
      return;
    case "STREAK_BROKEN":
      HAPTIC_PATTERNS.STREAK_BROKEN();
      return;
    case "BOSS_DAMAGE":
    case "SESSION_COMPLETE":
    default:
      HAPTIC_PATTERNS.BUTTON_PRESS();
  }
}

function triggerSound(event: FeedbackEvent): void {
  const sound = getSoundEffect(event.type);
  if (sound) {
    Sentry.addBreadcrumb({
      category: "sound",
      message: "[Sound Effect] " + sound,
      level: "debug",
    });
  }
}

function getSoundEffect(type: FeedbackEvent["type"]): string | null {
  switch (type) {
    case "STREAK_INCREMENT":
      return SOUND_EFFECTS.STREAK_INCREMENT;
    case "LEVEL_UP":
      return SOUND_EFFECTS.LEVEL_UP;
    case "BOSS_DEFEAT":
      return SOUND_EFFECTS.BOSS_DEFEAT;
    case "BOSS_DAMAGE":
      return SOUND_EFFECTS.BOSS_HIT;
    case "REWARD_EARNED":
      return SOUND_EFFECTS.REWARD_COMMON;
    case "SESSION_COMPLETE":
      return SOUND_EFFECTS.SESSION_COMPLETE;
    case "PHASE_CHANGE":
      return SOUND_EFFECTS.PHASE_CHANGE;
    case "STREAK_WARNING":
      return SOUND_EFFECTS.STREAK_WARNING;
    case "SESSION_INTERRUPTED":
    case "STREAK_BROKEN":
      return null;
  }
}

function triggerVisual(event: FeedbackEvent): void {
  const intensityMap = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  } satisfies Record<FeedbackEvent["intensity"], "low" | "medium" | "high">;

  eventBus.publish("feedback:visual", {
    ...event,
    intensity: intensityMap[event.intensity],
  });
}
