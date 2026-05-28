import { Platform } from "react-native";
import type {
  FeatureFlagConfig,
  FlagEvaluation,
  UserContext,
} from "./types";

export function getUserBucket(userId: string, flagKey: string): number {
  const str = `${userId}:${flagKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 100) + 1;
}

export function checkVersion(current: string, constraint: string): boolean {
  const currentParts = current.split(".").map(Number);
  const constraintParts = constraint.replace(">=", "").split(".").map(Number);
  for (
    let i = 0;
    i < Math.max(currentParts.length, constraintParts.length);
    i++
  ) {
    const currentPart = currentParts[i] || 0;
    const constraintPart = constraintParts[i] || 0;
    if (currentPart > constraintPart) {
      return true;
    }
    if (currentPart < constraintPart) {
      return false;
    }
  }
  return true;
}

export function evaluateFlag(
  flag: FeatureFlagConfig,
  userContext: UserContext | null,
): FlagEvaluation {
  let value = flag.defaultValue;
  let source: FlagEvaluation["source"] = "default";

  if (flag.platform && flag.platform.length > 0) {
    const currentPlatform = Platform.OS as "ios" | "android" | "web";
    if (!flag.platform.includes(currentPlatform)) {
      return {
        key: flag.key,
        value: false,
        source: "default",
        evaluatedAt: Date.now(),
      };
    }
  }

  if (flag.requiresPremium && userContext) {
    const isPremium = userContext.isPremium;
    if (isPremium !== true) {
      return {
        key: flag.key,
        value: false,
        source: "default",
        evaluatedAt: Date.now(),
      };
    }
  }

  if (flag.versionConstraint && userContext?.appVersion) {
    if (!checkVersion(userContext.appVersion, flag.versionConstraint)) {
      return {
        key: flag.key,
        value: false,
        source: "default",
        evaluatedAt: Date.now(),
      };
    }
  }

  if (flag.targetSegments && userContext?.segment) {
    if (!flag.targetSegments.includes(userContext.segment)) {
      return {
        key: flag.key,
        value: false,
        source: "default",
        evaluatedAt: Date.now(),
      };
    }
  }

  if (
    flag.rolloutPercentage !== undefined &&
    userContext &&
    typeof flag.defaultValue === "boolean"
  ) {
    const userBucket = getUserBucket(userContext.userId, flag.key);
    value =
      flag.defaultValue === true && userBucket <= flag.rolloutPercentage;
    source = userBucket <= flag.rolloutPercentage ? "local" : "default";
  }

  return { key: flag.key, value, source, evaluatedAt: Date.now() };
}
