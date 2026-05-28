import React from "react";

import { LockedFeatureScreen } from "../../components/LockedFeatureScreen";
import { useTheme } from "../../theme";

export type BossIntensity = "subtle" | "game-like" | "intense";

const BOSS_COPY: Record<string, { title: string; description: string }> = {
  subtle: {
    title: "Focus Momentum",
    description:
      "Each session you complete adds to your momentum. A quiet marker tracks the focus you have already earned.",
  },
  "game-like": {
    title: "Boss Battle",
    description:
      "Your focus sessions push the creature back, one block at a time. Every minute focused counts as damage.",
  },
  intense: {
    title: "Boss Battle — Full Assault",
    description:
      "Every session hits harder. Longer sessions deal critical damage. Your streak multiplies everything. Press the attack.",
  },
};

export function getBossCopy(bossIntensity: string): {
  title: string;
  description: string;
} {
  return BOSS_COPY[bossIntensity] ?? BOSS_COPY.subtle!;
}

export function toScreenIntensity(intensity: string): BossIntensity {
  if (
    intensity === "game-like" ||
    intensity === "intense" ||
    intensity === "subtle"
  )
    return intensity;
  return "subtle";
}

export const nextResetLabel = (): string => {
  const now = new Date();
  const day = now.getUTCDay();
  const days = (8 - day) % 7 || 7;
  const diff =
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + days,
      0,
      0,
      0,
    ) - Date.now();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  return `${d}d ${h}h`;
};

export const BossFallback: React.FC<{
  intensity: string;
  onStartSession: () => void;
  unlockReason: string;
  stage: string;
  resetLabel: string;
}> = ({ intensity, onStartSession, unlockReason, stage, resetLabel }) => {
  const { theme } = useTheme();
  const copy = getBossCopy(intensity);
  const isSubtle = intensity === "subtle";
  return (
    <LockedFeatureScreen
      ctaLabel="Start a focus session"
      description={copy.description}
      feature="boss_tab"
      icon={isSubtle ? "\u{1F4CA}" : "\u{1F409}"}
      onPress={onStartSession}
      progressLabel={resetLabel}
      stage={stage as "NEW_USER" | "ACTIVATING" | "ENGAGED" | "POWER_USER"}
      title={copy.title}
      unlockLabel={unlockReason}
      whyItMatters="Boss progress moves only when you complete focus sessions. No shop items, no premium boosts — just real focus time."
    />
  );
};
