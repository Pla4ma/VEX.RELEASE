export interface PaywallAnalytics {
  totalShows: number;
  totalDismisses: number;
  totalConversions: number;
  conversionRate: number;
  byContext: Record<
    string,
    { shows: number; conversions: number; rate: number }
  >;
}

const paywallAnalytics: PaywallAnalytics = {
  totalShows: 0,
  totalDismisses: 0,
  totalConversions: 0,
  conversionRate: 0,
  byContext: {},
};

export function trackPaywallEvent(
  event: "show" | "dismiss" | "convert",
  context: string,
): void {
  if (!paywallAnalytics.byContext[context]) {
    paywallAnalytics.byContext[context] = { shows: 0, conversions: 0, rate: 0 };
  }
  const data = paywallAnalytics.byContext[context];
  if (!data) {
    return;
  }
  switch (event) {
    case "show":
      paywallAnalytics.totalShows++;
      data.shows++;
      break;
    case "dismiss":
      paywallAnalytics.totalDismisses++;
      break;
    case "convert":
      paywallAnalytics.totalConversions++;
      data.conversions++;
      break;
  }
  paywallAnalytics.conversionRate =
    paywallAnalytics.totalShows > 0
      ? paywallAnalytics.totalConversions / paywallAnalytics.totalShows
      : 0;
  for (const ctx of Object.keys(paywallAnalytics.byContext)) {
    const ctxData = paywallAnalytics.byContext[ctx];
    if (ctxData) {
      ctxData.rate = ctxData.shows > 0 ? ctxData.conversions / ctxData.shows : 0;
    }
  }
}

export function getPaywallAnalytics(): PaywallAnalytics {
  return { ...paywallAnalytics };
}

export function getBestPaywallContext(): string | null {
  let bestContext: string | null = null;
  let bestRate = 0;
  for (const [context, data] of Object.entries(paywallAnalytics.byContext)) {
    if (data.rate > bestRate && data.shows > 10) {
      bestRate = data.rate;
      bestContext = context;
    }
  }
  return bestContext;
}
