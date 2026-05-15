/**
 * Paywall Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Tracks paywall performance and conversion metrics.
 */

import { eventBus } from '../events';
import type { PaywallAnalytics } from './types';

const paywallData = new Map<string, PaywallAnalytics>();

export function trackPaywallEvent(
  userId: string,
  context: string,
  event: 'view' | 'convert' | 'dismiss',
  value?: number
): void {
  let analytics = paywallData.get(context);
  if (!analytics) {
    analytics = { context, views: 0, conversions: 0, revenue: 0, conversionRate: 0, averageRevenuePerView: 0 };
  }

  switch (event) {
    case 'view':
      analytics.views++;
      break;
    case 'convert':
      analytics.conversions++;
      if (value) {analytics.revenue += value;}
      break;
    case 'dismiss':
      break;
  }

  analytics.conversionRate = analytics.views > 0 ? analytics.conversions / analytics.views : 0;
  analytics.averageRevenuePerView = analytics.views > 0 ? analytics.revenue / analytics.views : 0;

  paywallData.set(context, analytics);

  eventBus.publish('analytics:track', { event: 'analytics:paywall', properties: { userId, context, event, analytics: { ...analytics } } });
}

export function getPaywallAnalytics(): PaywallAnalytics[] {
  return Array.from(paywallData.values()).sort((a, b) => b.conversionRate - a.conversionRate);
}

export function getBestPaywallContext(): string | null {
  const analytics = getPaywallAnalytics();
  return analytics.length > 0 ? analytics[0].context : null;
}
