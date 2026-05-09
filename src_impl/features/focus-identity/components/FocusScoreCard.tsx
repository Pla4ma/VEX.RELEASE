/**
 * Focus Score Card Component
 *
 * Displays user's Focus Score with loading, error, and empty states.
 * Includes percentile ranking and band information.
 */

import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { useFocusIdentity, useFocusScoreColor, useIdentityStatement } from '../hooks';

interface FocusScoreCardProps {
  userId: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  animate?: boolean;
}

export function FocusScoreCard({ userId, onPress, size = 'medium', showTrend = true, animate = true }: FocusScoreCardProps) {
  const { theme } = useTheme();
  const { profile, loadingState, error, isRetrying, retry, currentBand, scoreChange } = useFocusIdentity(userId);

  const scoreColor = useFocusScoreColor(profile?.currentScore || null);
  const identityStatement = useIdentityStatement(currentBand, profile?.streakInCurrentBand || 0);

  // Animation values
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  // Animated styles
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Calculate score progress (0-1)
  const scoreProgress = useMemo(() => {
    if (!profile) {
      return 0;
    }
    return (profile.currentScore - 300) / (850 - 300);
  }, [profile]);

  // Animate on mount
  React.useEffect(() => {
    if (animate && profile) {
      progress.value = withTiming(scoreProgress, { duration: 1000 });
    }
  }, [profile, animate, scoreProgress, progress]);

  const handlePress = () => {
    if (onPress) {
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      onPress();
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <Box padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'} backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <View style={{ gap: 12 }}>
          <View style={{ height: 48, borderRadius: 4, width: '40%', backgroundColor: theme.colors.border.DEFAULT }} />
          <View style={{ height: 24, borderRadius: 4, backgroundColor: theme.colors.border.DEFAULT, width: '60%' }} />
          <View style={{ height: 16, borderRadius: 4, width: '80%', backgroundColor: theme.colors.border.DEFAULT }} />
        </View>
      </Box>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (loadingState === 'error' && !profile) {
    return (
      <Box padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'} backgroundColor="surface" borderRadius="lg" style={{ width: '100%', alignItems: 'center', gap: 8 }}>
        <Text variant="heading3" color="error" style={{ fontSize: 32 }}>
          ⚠️
        </Text>
        <Text variant="body" color="error" style={{ textAlign: 'center' }}>
          Failed to load Focus Score
        </Text>
        {error && (
          <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>
            {error.message}
          </Text>
        )}
        <Pressable onPress={retry} disabled={isRetrying} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 8, backgroundColor: theme.colors.primary[500] }}>
          <Text variant="button" color="background">
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Text>
        </Pressable>
      </Box>
    );
  }

  // ============================================================================
  // RETRYING STATE
  // ============================================================================
  if (loadingState === 'retrying') {
    return (
      <Box padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'} backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
          Retrying...
        </Text>
      </Box>
    );
  }

  // ============================================================================
  // EMPTY STATE (No user ID)
  // ============================================================================
  if (!userId) {
    return (
      <Box padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'} backgroundColor="surface" borderRadius="lg" style={{ width: '100%' }}>
        <Text variant="body" color="textMuted">
          Sign in to see your Focus Score
        </Text>
      </Box>
    );
  }

  // ============================================================================
  // SUCCESS STATE
  // ============================================================================
  const isPositiveChange = scoreChange > 0;
  const isNegativeChange = scoreChange < 0;

  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <Animated.View style={[animatedStyles]}>
        <Box padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'} backgroundColor="surface" borderRadius="lg" style={{ width: '100%', borderColor: scoreColor, borderWidth: 2 }}>
          {/* Score Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text variant={size === 'large' ? 'display' : size === 'small' ? 'heading3' : 'heading2'} color="text" style={{ fontWeight: '700', color: scoreColor }}>
                {profile?.currentScore || '---'}
              </Text>
              <Text variant="caption" color="textMuted">
                Focus Score
              </Text>
            </View>

            {currentBand && (
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: scoreColor + '20' }}>
                <Text variant="caption" style={{ fontWeight: '600', color: scoreColor }}>
                  {currentBand.label}
                </Text>
              </View>
            )}
          </View>

          {/* Score Change */}
          {showTrend && scoreChange !== 0 && (
            <View style={{ marginTop: 8 }}>
              <Text
                variant="body"
                style={{
                  fontWeight: '500',
                  color: isPositiveChange ? theme.colors.success.DEFAULT : isNegativeChange ? theme.colors.error.DEFAULT : undefined,
                }}
              >
                {isPositiveChange ? '↑' : '↓'} {Math.abs(scoreChange)} from last check
              </Text>
            </View>
          )}

          {/* Recovery Indicator */}
          {profile?.isInRecovery && (
            <Box padding="sm" backgroundColor="warning" borderRadius="md" style={{ marginTop: 12 }}>
              <Text variant="caption" color="warning">
                🔥 Recovery Mode: +50% XP bonus active!
              </Text>
            </Box>
          )}

          {/* Identity Statement */}
          <Text variant="body" color="text" style={{ marginTop: 12, fontStyle: 'italic' }}>
            {identityStatement}
          </Text>

          {/* Percentile */}
          {profile?.percentileRank && (
            <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
              Top {100 - profile.percentileRank}% of users
            </Text>
          )}

          {/* Progress Bar */}
          <View style={{ height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: scoreColor,
                width: `${scoreProgress * 100}%`,
              }}
            />
          </View>

          {/* Next Milestone */}
          {currentBand && currentBand.max < 850 && (
            <Text variant="caption" color="textMuted" style={{ marginTop: 4, textAlign: 'right' }}>
              {currentBand.max + 1 - (profile?.currentScore || 0)} points to {getNextBandLabel(currentBand.label)}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}

function getNextBandLabel(currentLabel: string): string {
  const progression: Record<string, string> = {
    Building: 'Fair',
    Fair: 'Good',
    Good: 'Strong',
    Strong: 'Exceptional',
    Exceptional: 'Elite',
    Elite: 'Legendary',
  };
  return progression[currentLabel] || 'Max';
}
