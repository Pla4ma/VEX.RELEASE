/**
 * Monetization Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Tracks and calculates monetization metrics.
 */

import { eventBus } from '../events';
import type { MonetizationMetrics } from './types';

const monetizationData = new Map<string, MonetizationMetrics>();

export function trackMonetizationEvent(
  userId: string,
  event: {
    type: 'subscription_start' | 'subscription_cancel' | 'purchase' | 'paywall_view' | 'paywall_convert';
    value?: number;
    productType?: string;
  }
): void {
  let metrics = monetizationData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      totalRevenue: 0,
      subscriptionRevenue: 0,
      iapRevenue: 0,
      subscriptionType: 'free',
      ltv: 0,
      paywallViews: 0,
      paywallConversions: 0,
      purchaseCount: 0,
    };
  }

  switch (event.type) {
    case 'subscription_start':
      metrics.subscriptionType = event.productType as 'premium' | 'premium_plus' || 'premium';
      metrics.subscriptionStart = new Date().toISOString();
      if (event.value) {
        metrics.subscriptionRevenue += event.value;
        metrics.totalRevenue += event.value;
      }
      break;
    case 'subscription_cancel':
      metrics.subscriptionEnd = new Date().toISOString();
      metrics.subscriptionType = 'free';
      break;
    case 'purchase':
      metrics.purchaseCount++;
      metrics.lastPurchaseDate = new Date().toISOString();
      if (!metrics.firstPurchaseDate) metrics.firstPurchaseDate = metrics.lastPurchaseDate;
      if (event.value) {
        if (event.productType === 'subscription') {
          metrics.subscriptionRevenue += event.value;
        } else {
          metrics.iapRevenue += event.value;
        }
        metrics.totalRevenue += event.value;
      }
      break;
    case 'paywall_view':
      metrics.paywallViews++;
      break;
    case 'paywall_convert':
      metrics.paywallConversions++;
      break;
  }

  metrics.ltv = metrics.totalRevenue;
  monetizationData.set(userId, metrics);

  eventBus.publish('analytics:monetization', { userId, event: event.type, metrics });
}

export function getMonetizationMetrics(): {
  premiumConversionRate: number;
  averageLtv: number;
  totalRevenue: number;
  paywallConversionRate: number;
} {
  const users = Array.from(monetizationData.values());
  if (users.length === 0) {
    return { premiumConversionRate: 0, averageLtv: 0, totalRevenue: 0, paywallConversionRate: 0 };
  }

  const premiumUsers = users.filter((user) => user.subscriptionType !== 'free');
  const premiumConversionRate = premiumUsers.length / users.length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalRevenue, 0);
  const averageLtv = totalRevenue / users.length;
  const totalPaywallViews = users.reduce((sum, user) => sum + user.paywallViews, 0);
  const totalPaywallConversions = users.reduce((sum, user) => sum + user.paywallConversions, 0);
  const paywallConversionRate = totalPaywallViews > 0 ? totalPaywallConversions / totalPaywallViews : 0;

  return { premiumConversionRate, averageLtv, totalRevenue, paywallConversionRate };
}