import type { PaywallContextType } from "./PremiumTierSystem";

interface ConversionMetrics {
  userId: string;
  context: PaywallContextType;
  shownAt: number;
  converted: boolean;
  convertedAt?: number;
  dismissed: boolean;
  timeToDecide: number;
}

const conversionMetrics: ConversionMetrics[] = [];

export function recordConversion(
  userId: string,
  context: PaywallContextType,
  converted: boolean,
  timeToDecide: number,
): void {
  conversionMetrics.push({
    userId,
    context,
    shownAt: Date.now(),
    converted,
    convertedAt: converted ? Date.now() : undefined,
    dismissed: !converted,
    timeToDecide,
  });
}

export function getConversionRate(context: PaywallContextType): number {
  const metrics = conversionMetrics.filter((m) => m.context === context);
  if (metrics.length === 0) return 0;
  return metrics.filter((m) => m.converted).length / metrics.length;
}

export function getBestConvertingContext(): PaywallContextType | null {
  const contexts: PaywallContextType[] = [
    "DEEP_COACH_MEMORY",
    "ADVANCED_STUDY_OS",
    "PROGRESS_INTELLIGENCE",
    "VISUAL_IDENTITY",
    "PREMIUM_SESSION_MODES",
    "RECOVERY_PLANNING",
  ];
  let best: PaywallContextType | null = null;
  let bestRate = 0;
  for (const ctx of contexts) {
    const rate = getConversionRate(ctx);
    if (rate > bestRate) {
      bestRate = rate;
      best = ctx;
    }
  }
  return best;
}
