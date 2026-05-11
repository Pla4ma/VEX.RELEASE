/**
 * BattlePassUrgencyBanner Component
 *
 * Shows urgency when season end approaches (< 7 days).
 * Displays unclaimed tiers count and creates FOMO for completion.
 *
 * @phase 6B.2
 */

import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { capture } from '../../../shared/analytics';
import { EconomyEvents } from '../../../shared/analytics/analytics-events';
import { createSheet } from '@/shared/ui/create-sheet';

const URGENCY_GRADIENT = ['#EF4444', '#F97316', '#F59E0B'] as const;

interface BattlePassUrgencyBannerProps {
  /** Days remaining until season ends */
  daysRemaining: number;
  /** Current tier (free track) */
  currentTier: number;
  /** Total tiers in season */
  totalTiers: number;
  /** Number of unclaimed tiers (both free and premium if applicable) */
  unclaimedTiers: number;
  /** Whether user has premium */
  hasPremium: boolean;
  /** Maximum tier free users can reach */
  freeTierCap?: number;
  /** Navigate to battle pass */
  onViewBattlePass: () => void;
  /** Navigate to purchase premium */
  onUpgradeToPremium?: () => void;
}

export function BattlePassUrgencyBanner({ daysRemaining, currentTier, totalTiers, unclaimedTiers, hasPremium, freeTierCap = 40, onViewBattlePass, onUpgradeToPremium }: BattlePassUrgencyBannerProps): JSX.Element | null {

  // Pulsing animation for high urgency
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (daysRemaining <= 3) {
      pulseScale.value = withRepeat(withSequence(withTiming(1.02, { duration: 600 }), withTiming(1, { duration: 600 })), -1, true);
      pulseOpacity.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.7, { duration: 600 })), -1, true);
    }
  }, [daysRemaining, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // Calculate urgency level
  const urgencyLevel = useMemo(() => {
    if (daysRemaining <= 1) {
      return 'critical';
    }
    if (daysRemaining <= 3) {
      return 'high';
    }
    return 'medium';
  }, [daysRemaining]);

  // Calculate if free user is capped
  const isCapped = !hasPremium && currentTier >= freeTierCap;
  const tiersUntilCap = freeTierCap - currentTier;

  // Calculate progress percentage
  const progressPercent = Math.min(100, (currentTier / totalTiers) * 100);
  const remainingTiers = totalTiers - currentTier;

  const handleViewBattlePass = () => {
    capture(EconomyEvents.PAYWALL_VIEWED, {
      source: 'battle_pass_urgency_banner',
    });
    onViewBattlePass();
  };

  const handleUpgrade = () => {
    capture(EconomyEvents.PAYWALL_VIEWED, {
      source: 'battle_pass_urgency_upgrade',
    });
    onUpgradeToPremium?.();
  };

  // Only show when < 7 days remaining or unclaimed tiers exist
  const shouldShow = daysRemaining <= 7 || unclaimedTiers > 0;

  if (!shouldShow) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={[styles.container, pulseStyle]}>
      <LinearGradient colors={URGENCY_GRADIENT} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {/* Urgency Badge */}
        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyText}>
            {urgencyLevel === 'critical' && '🚨 CRITICAL'}
            {urgencyLevel === 'high' && '⚠️ URGENT'}
            {urgencyLevel === 'medium' && '⏰ LIMITED TIME'}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>
            Season Ends in {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: '#FFFFFF' }]} />
              {isCapped && (
                <View style={[styles.capIndicator, { left: `${(freeTierCap / totalTiers) * 100}%` }]}>
                  <Text style={styles.capText}>FREE CAP</Text>
                </View>
              )}
            </View>
            <Text style={styles.progressText}>
              Tier {currentTier} / {totalTiers}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{unclaimedTiers}</Text>
              <Text style={styles.statLabel}>Unclaimed {unclaimedTiers === 1 ? 'Tier' : 'Tiers'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{remainingTiers}</Text>
              <Text style={styles.statLabel}>{remainingTiers === 1 ? 'Tier' : 'Tiers'} Remaining</Text>
            </View>
            {!hasPremium && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, isCapped && styles.cappedValue]}>{isCapped ? 'CAPPED' : tiersUntilCap}</Text>
                  <Text style={styles.statLabel}>{isCapped ? 'Upgrade to continue' : 'Tiers until cap'}</Text>
                </View>
              </>
            )}
          </View>

          {/* Premium Lock Message for Free Users */}
          {!hasPremium && isCapped && (
            <View style={styles.lockedMessage}>
              <Text style={styles.lockedText}>
                🔒 Free users cannot progress past Tier {freeTierCap}. Upgrade to unlock all {remainingTiers} remaining tiers!
              </Text>
            </View>
          )}

          {/* Premium Milestone Teaser */}
          {!hasPremium && !isCapped && currentTier < totalTiers && (
            <View style={styles.milestoneTeaser}>
              <Text style={styles.milestoneText}>
                🎯 Tier {Math.min(freeTierCap + 10, totalTiers)} milestone reward:
                <Text style={styles.milestoneHighlight}> Legendary Item</Text>
              </Text>
            </View>
          )}

          {/* CTAs */}
          <View style={styles.actions}>
            <Button onPress={handleViewBattlePass} variant="secondary" size="md" style={styles.viewButton} accessibilityLabel="View Battle Pass → button" accessibilityRole="button" accessibilityHint="Activates this control">
              View Battle Pass →
            </Button>

            {!hasPremium && onUpgradeToPremium && (
              <Button onPress={handleUpgrade} variant="primary" size="md" style={styles.upgradeButton} accessibilityLabel="🔓 Unlock Premium button" accessibilityRole="button" accessibilityHint="Activates this control">
                🔓 Unlock Premium
              </Button>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    gap: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  capIndicator: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 2,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capText: {
    position: 'absolute',
    top: -20,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cappedValue: {
    color: '#FFD700',
    fontSize: 14,
  },
  lockedMessage: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  lockedText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  milestoneTeaser: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  milestoneText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  milestoneHighlight: {
    color: '#FFD700',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  upgradeButton: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
});

export default BattlePassUrgencyBanner;
