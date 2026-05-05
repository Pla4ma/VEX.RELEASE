/**
 * Focus Score Dashboard
 *
 * Phase 2: Progression Redesign
 * Primary home screen widget showing the user's Focus Score (300-850)
 * like a credit score app. This becomes the central identity metric.
 *
 * Dependencies:
 * - features/focus-identity/FocusIdentityEngine (score data)
 * - feature-flags (gradual rollout)
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
// TODO: Install react-native-chart-kit and uncomment below
// import { LineChart } from 'react-native-chart-kit';

import { Text } from '../../components/primitives/Text';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import type { FocusIdentityProfile, ScoreBand, FocusScoreFactors } from './FocusIdentityEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FocusScoreDashboardProps {
  profile: FocusIdentityProfile | null;
  onPress?: () => void;
  compact?: boolean;
}

/**
 * Focus Score Dashboard Component
 * Shows credit-score style display with percentile ranking
 */
export const FocusScoreDashboard: React.FC<FocusScoreDashboardProps> = ({
  profile,
  onPress,
  compact = false,
}) => {
  const scale = useSharedValue(1);

  // Check if feature is enabled
  if (!featureFlags.isEnabled('focus_score_primary')) {
    return null;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your Focus Score...</Text>
      </View>
    );
  }

  const { currentScore, previousScore, band, percentileRank, factors, scoreHistory } = profile;
  const scoreChange = currentScore - previousScore;

  // Animation on mount
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Chart data (last 30 days)
  const chartData = useMemo(() => {
    const recent = scoreHistory.slice(-30);
    return {
      labels: recent.length > 7
        ? recent.filter((_, i) => i % 5 === 0).map(h => h.date.slice(5)) // MM-DD
        : recent.map(h => h.date.slice(5)),
      datasets: [{
        data: recent.map(h => h.score),
        color: () => band.color,
        strokeWidth: 2,
      }],
    };
  }, [scoreHistory, band.color]);

  // Score gauge position (0-100%)
  const gaugePercent = ((currentScore - 300) / (850 - 300)) * 100;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Your Focus Score</Text>

          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: band.color }]}>
              {currentScore}
            </Text>

            {scoreChange !== 0 && (
              <View style={[
                styles.changeBadge,
                { backgroundColor: scoreChange > 0 ? '#10B981' : '#EF4444' },
              ]}>
                <Text style={styles.changeText}>
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.bandLabel, { color: band.color }]}>
            {band.title}
          </Text>

          <Text style={styles.percentileText}>
            Top {100 - percentileRank}% of focused people
          </Text>
        </View>

        {/* Score Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeBackground}>
            <View style={[
              styles.gaugeFill,
              {
                width: `${gaugePercent}%`,
                backgroundColor: band.color,
              },
            ]} />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>300</Text>
            <Text style={styles.gaugeLabel}>850</Text>
          </View>
        </View>

        {/* Factor Breakdown (non-compact) */}
        {!compact && (
          <View style={styles.factorsSection}>
            <Text style={styles.factorsTitle}>Score Factors</Text>
            <FactorRadar factors={factors} />
          </View>
        )}

        {/* Score History Chart (non-compact) */}
        {/* TODO: Install react-native-chart-kit and uncomment this section */}
        {/* {!compact && scoreHistory.length > 7 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>30-Day Trend</Text>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 64}
              height={120}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: () => band.color,
                labelColor: () => '#9CA3AF',
                style: { borderRadius: 16 },
                propsForDots: { r: '3', strokeWidth: '2' },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )} */}

        {/* Identity Statement */}
        <View style={styles.identitySection}>
          <Text style={styles.identityText}>
            "{profile.identityStatement}"
          </Text>
        </View>

        {/* Recommended Actions */}
        {!compact && profile.recommendedActions.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
            {profile.recommendedActions.slice(0, 3).map((action, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationBullet}>•</Text>
                <Text style={styles.recommendationText}>{action}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Factor Radar Chart (simplified)
 */
const FactorRadar: React.FC<{ factors: FocusScoreFactors }> = ({ factors }) => {
  const factorItems = [
    { key: 'consistency', label: 'Consistency', value: factors.consistency.score, weight: 35 },
    { key: 'streak', label: 'Streak', value: factors.streakStability.score, weight: 30 },
    { key: 'quality', label: 'Quality', value: factors.sessionQuality.score, weight: 15 },
    { key: 'diversity', label: 'Diversity', value: factors.diversity.score, weight: 10 },
    { key: 'recency', label: 'Recency', value: factors.recency.score, weight: 10 },
  ];

  return (
    <View style={styles.radarContainer}>
      {factorItems.map((item) => (
        <View key={item.key} style={styles.factorRow}>
          <Text style={styles.factorLabel}>{item.label}</Text>
          <View style={styles.factorBarContainer}>
            <View style={[
              styles.factorBar,
              { width: `${item.value}%`, opacity: 0.7 + (item.weight / 100) },
            ]} />
          </View>
          <Text style={styles.factorValue}>{item.value}</Text>
          <Text style={styles.factorWeight}>({item.weight}%)</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 20,
    margin: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center' as const,
  },
  scoreSection: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800' as const,
  },
  changeBadge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  bandLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  percentileText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  gaugeContainer: {
    marginBottom: 20,
  },
  gaugeBackground: {
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 6,
  },
  gaugeLabels: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 4,
  },
  gaugeLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  factorsSection: {
    marginBottom: 20,
  },
  factorsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  radarContainer: {
    gap: 8,
  },
  factorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  factorLabel: {
    color: '#D1D5DB',
    fontSize: 13,
    width: 70,
  },
  factorBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  factorBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  factorValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
    width: 30,
    textAlign: 'right' as const,
  },
  factorWeight: {
    color: '#6B7280',
    fontSize: 11,
    width: 40,
    textAlign: 'right' as const,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  identitySection: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  identityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
  },
  recommendationsSection: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  recommendationsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  recommendationBullet: {
    color: '#3B82F6',
    fontSize: 14,
    marginRight: 8,
  },
  recommendationText: {
    color: '#D1D5DB',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});

/**
 * Compact version for home screen
 */
export const FocusScoreCompact: React.FC<{
  profile: FocusIdentityProfile | null;
  onPress?: () => void;
}> = ({ profile, onPress }) => {
  return <FocusScoreDashboard profile={profile} onPress={onPress} compact={true} />;
};
