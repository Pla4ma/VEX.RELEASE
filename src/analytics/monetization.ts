import { eventBus } from "../events";

export interface MonetizationMetrics {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  trialUsers: number;
  conversionRate: number;
  trialConversionRate: number;
  averageLTV: number;
  totalRevenue: number;
  arpu: number;
  mrr: number;
}

let monetizationMetrics: MonetizationMetrics = {
  totalUsers: 0,
  freeUsers: 0,
  premiumUsers: 0,
  trialUsers: 0,
  conversionRate: 0,
  trialConversionRate: 0,
  averageLTV: 0,
  totalRevenue: 0,
  arpu: 0,
  mrr: 0,
};

export function trackMonetizationEvent(event: {
  type:
    | "subscription_start"
    | "trial_start"
    | "trial_convert"
    | "cancellation"
    | "renewal";
  userId: string;
  value?: number;
  tier?: "FREE" | "PREMIUM";
}): void {
  switch (event.type) {
    case "trial_start":
      monetizationMetrics.trialUsers++;
      break;
    case "trial_convert":
      monetizationMetrics.trialUsers--;
      monetizationMetrics.premiumUsers++;
      monetizationMetrics.freeUsers--;
      break;
    case "subscription_start":
      monetizationMetrics.premiumUsers++;
      if (event.value) {
        monetizationMetrics.totalRevenue += event.value;
        monetizationMetrics.mrr += event.value / 12;
      }
      break;
    case "cancellation":
      monetizationMetrics.premiumUsers--;
      monetizationMetrics.freeUsers++;
      if (event.value) {
        monetizationMetrics.mrr -= event.value / 12;
      }
      break;
  }
  monetizationMetrics.totalUsers =
    monetizationMetrics.freeUsers + monetizationMetrics.premiumUsers;
  monetizationMetrics.conversionRate =
    monetizationMetrics.totalUsers > 0
      ? monetizationMetrics.premiumUsers / monetizationMetrics.totalUsers
      : 0;
  monetizationMetrics.trialConversionRate =
    monetizationMetrics.trialUsers > 0
      ? monetizationMetrics.premiumUsers /
        (monetizationMetrics.premiumUsers + monetizationMetrics.trialUsers)
      : 0;
  monetizationMetrics.arpu =
    monetizationMetrics.totalUsers > 0
      ? monetizationMetrics.totalRevenue / monetizationMetrics.totalUsers
      : 0;
  eventBus.publish("analytics:monetization", {
    event: event.type,
    userId: event.userId,
    metrics: { ...monetizationMetrics },
  });
}

export function getMonetizationMetrics(): MonetizationMetrics {
  return { ...monetizationMetrics };
}
