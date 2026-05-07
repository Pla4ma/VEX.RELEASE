/**
 * Paywall Analytics
 *
 * Paywall conversion tracking and optimization
 */

import { PaywallAnalytics } from './types';

const paywallAnalytics: PaywallAnalytics = {
  paywallId: 'default',
  context: 'general',
  impressions: 0,
  conversions: 0,
  conversionRate: 0,
  revenue: 0,
  averageTimeToConvert: 0,
  abandonmentRate: 0,
  bestContext: '',
  contexts: {},
};

/**
 * Track paywall event
 */
export function trackPaywallEvent(event: "show" | "dismiss" | "convert", context: string, revenue?: number): void {
  if (!paywallAnalytics.contexts[context]) {
    paywallAnalytics.contexts[context] = {
      impressions: 0,
      conversions: 0,
      revenue: 0,
    };
  }

  switch (event) {
    case "show":
      paywallAnalytics.impressions++;
      paywallAnalytics.contexts[context].impressions++;
      break;
    case "dismiss":
      // Track abandonment
      paywallAnalytics.abandonmentRate = paywallAnalytics.impressions > 0 ? 
        (paywallAnalytics.impressions - paywallAnalytics.conversions) / paywallAnalytics.impressions : 0;
      break;
    case "convert":
      paywallAnalytics.conversions++;
      paywallAnalytics.contexts[context].conversions++;
      if (revenue) {
        paywallAnalytics.revenue += revenue;
        paywallAnalytics.contexts[context].revenue += revenue;
      }
      break;
  }

  // Recalculate rates
  paywallAnalytics.conversionRate = paywallAnalytics.impressions > 0 ? paywallAnalytics.conversions / paywallAnalytics.impressions : 0;

  for (const ctx of Object.keys(paywallAnalytics.contexts)) {
    const data = paywallAnalytics.contexts[ctx];
    const ctxRate = data.impressions > 0 ? data.conversions / data.impressions : 0;
    
    // Update best context if this one is better
    if (ctxRate > paywallAnalytics.conversionRate && data.impressions > 10) {
      paywallAnalytics.bestContext = ctx;
    }
  }
}

/**
 * Get paywall analytics
 */
export function getPaywallAnalytics(): PaywallAnalytics {
  return { ...paywallAnalytics };
}

/**
 * Get best converting paywall context
 */
export function getBestPaywallContext(): string {
  let bestContext = '';
  let bestRate = 0;

  for (const [context, data] of Object.entries(paywallAnalytics.contexts)) {
    if (data.impressions > 10) {
      const rate = data.conversions / data.impressions;
      if (rate > bestRate) {
        bestRate = rate;
        bestContext = context;
      }
    }
  }

  return bestContext || 'general';
}

/**
 * Reset paywall analytics (for testing)
 */
export function resetPaywallAnalytics(): void {
  paywallAnalytics.impressions = 0;
  paywallAnalytics.conversions = 0;
  paywallAnalytics.conversionRate = 0;
  paywallAnalytics.revenue = 0;
  paywallAnalytics.abandonmentRate = 0;
  paywallAnalytics.bestContext = '';
  paywallAnalytics.contexts = {};
}