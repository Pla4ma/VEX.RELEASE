import { launchColors } from "@theme/tokens/launch-colors";

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

export const PROGRESS_MESSAGES: Record<
  number,
  { title: string; subtitle: string; emoji: string }
> = {
  25: {
    title: "25% Complete!",
    subtitle: "Great start! Keep going!",
    emoji: "🌟",
  },
  50: {
    title: "Halfway There!",
    subtitle: "You're doing amazing!",
    emoji: "🔥",
  },
  75: {
    title: "75% Done!",
    subtitle: "Almost there! Push through!",
    emoji: "⚡",
  },
  90: {
    title: "Almost Done!",
    subtitle: "Final stretch! You got this!",
    emoji: "🏆",
  },
};

export const MINUTE_MESSAGES: Record<
  number,
  { title: string; subtitle: string; emoji: string }
> = {
  10: { title: "10 Minutes!", subtitle: "Focus power building!", emoji: "💪" },
  20: { title: "20 Minutes!", subtitle: "Deep focus zone!", emoji: "🧠" },
  30: {
    title: "30 Minutes!",
    subtitle: "Half hour of pure focus!",
    emoji: "👑",
  },
  45: {
    title: "45 Minutes!",
    subtitle: "Legendary concentration!",
    emoji: "💎",
  },
  60: { title: "1 Hour!", subtitle: "You are unstoppable!", emoji: "🚀" },
};

export function generateParticles(count: number): Particle[] {
  const colors = [
    launchColors.hex_f59e0b,
    launchColors.hex_3b82f6,
    launchColors.hex_10b981,
    launchColors.hex_ec4899,
    launchColors.hex_8b5cf6,
    launchColors.hex_fbbf24,
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 300 - 150,
    y: Math.random() * -200 - 50,
    color: colors[Math.floor(Math.random() * colors.length)]!,
    size: Math.random() * 10 + 5,
    delay: Math.random() * 500,
  }));
}

export interface CheckpointCelebrationProps {
  progressPercent: number;
  elapsedMinutes: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export function detectCheckpoint(
  progressPercent: number,
  elapsedMinutes: number,
  lastCheckpoint: number,
): { type: "progress" | "minute"; value: number; title: string; subtitle: string; emoji: string } | null {
  const progressCheckpoints = [25, 50, 75, 90];
  for (const checkpoint of progressCheckpoints) {
    if (progressPercent >= checkpoint && lastCheckpoint < checkpoint) {
      const message = PROGRESS_MESSAGES[checkpoint];
      if (message) {
        return { type: "progress", value: checkpoint, ...message };
      }
    }
  }
  const minuteCheckpoints = [10, 20, 30, 45, 60];
  for (const checkpoint of minuteCheckpoints) {
    if (elapsedMinutes === checkpoint && lastCheckpoint < checkpoint + 100) {
      const message = MINUTE_MESSAGES[checkpoint];
      if (message) {
        return { type: "minute", value: checkpoint, ...message };
      }
    }
  }
  return null;
}
