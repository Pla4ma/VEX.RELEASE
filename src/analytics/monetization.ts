/**
 * Monetization Analytics
 *
 * Revenue tracking and conversion metrics
 */

import { MonetizationMetrics } from './types';
import { eventBus } from '../events';

let monetizationMetrics: MonetizationMetrics = {
  userId: 'aggregate',
  totalUsers: 0,
  freeUsers: 0,
  premiumUsers: 0,
  trialUsers: 0,
  conversionRate: 0,
  premiumConversionRate: 0,
  trialConversionRate: 0,
  averageLTV: 0,
  totalRevenue: 0,
  arpu: 0, // Average revenue per user
  mrr: 0, // Monthly recurring revenue
  isPremium: false,
  lifetimeValue: 0,
  purchases: 0,
  totalSpent: 0,
  subscriptionRevenue: 0,
  oneTimeRevenue: 0,
  refundRate: 0,
};

/**
 * Track monetization event
 */
export function trackMonetizationEvent(event: {
  type: 'subscription_start' | 'trial_start' | 'trial_convert' | 'cancellation' | 'renewal';
  userId: string;
  value?: number;
  tier?: 'FREE' | 'PREMIUM'
}): void {
  switch (event.type) {
    case 'trial_start':
      monetizationMetrics.trialUsers++;
      break;
    case 'trial_convert':
      monetizationMetrics.trialUsers--;
      monetizationMetrics.premiumUsers++;
      monetizationMetrics.freeUsers--;
      break;
    case 'subscription_start':
      monetizationMetrics.premiumUsers++;
      if (event.value) {
        monetizationMetrics.totalRevenue += event.value;
        monetizationMetrics.mrr += event.value / 12; // Assume annual
      }
      break;
    case 'cancellation':
      monetizationMetrics.premiumUsers--;
      monetizationMetrics.freeUsers++;
      if (event.value) {
        monetizationMetrics.mrr -= event.value / 12;
      }
      break;
  }

  // Recalculate rates
  monetizationMetrics.totalUsers = monetizationMetrics.freeUsers + monetizationMetrics.premiumUsers;
  monetizationMetrics.conversionRate = monetizationMetrics.totalUsers > 0 ? monetizationMetrics.premiumUsers / monetizationMetrics.totalUsers : 0;
  monetizationMetrics.premiumConversionRate = monetizationMetrics.conversionRate;
  monetizationMetrics.trialConversionRate = monetizationMetrics.trialUsers > 0 ? monetizationMetrics.premiumUsers / (monetizationMetrics.premiumUsers + monetizationMetrics.trialUsers) : 0;
  monetizationMetrics.arpu = monetizationMetrics.totalUsers > 0 ? monetizationMetrics.totalRevenue / monetizationMetrics.totalUsers : 0;
  monetizationMetrics.averageLTV = monetizationMetrics.arpu;
  monetizationMetrics.lifetimeValue = monetizationMetrics.averageLTV;
  monetizationMetrics.totalSpent = monetizationMetrics.totalRevenue;
  monetizationMetrics.subscriptionRevenue = monetizationMetrics.mrr;

  eventBus.publish('analytics:monetization', {
    event: event.type,
    userId: event.userId,
    metrics: { ...monetizationMetrics },
  });
}

/**
 * Get monetization metrics
 */
export function getMonetizationMetrics(): MonetizationMetrics {
  return { ...monetizationMetrics };
}

/**
 * Reset monetization metrics (for testing)
 */
export function resetMonetizationMetrics(): void {
  monetizationMetrics = {
    userId: 'aggregate',
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    trialUsers: 0,
    conversionRate: 0,
    premiumConversionRate: 0,
    trialConversionRate: 0,
    averageLTV: 0,
    totalRevenue: 0,
    arpu: 0,
    mrr: 0,
    isPremium: false,
    lifetimeValue: 0,
    purchases: 0,
    totalSpent: 0,
    subscriptionRevenue: 0,
    oneTimeRevenue: 0,
    refundRate: 0,
  };
}
