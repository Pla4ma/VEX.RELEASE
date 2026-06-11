import React from 'react';
import { View, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getNextBandLabel } from './FocusScoreCardStates';

interface FocusScoreCardContentProps {
  size: 'small' | 'medium' | 'large';
  handlePress: () => void;
  onPress: (() => void) | undefined;
  animatedStyles: object;
  scoreColor: string;
  currentScore: number;
  currentBand: { label: string; max: number } | null;
  scoreChange: number;
  showTrend: boolean;
  identityStatement: string;
  scoreProgress: number;
  percentileRank: number | null;
  isInRecovery: boolean;
  successColor: string;
  errorColor: string;
}

export function FocusScoreCardContent({
  size,
  handlePress,
  onPress,
  animatedStyles,
  scoreColor,
  currentScore,
  currentBand,
  scoreChange,
  showTrend,
  identityStatement,
  scoreProgress,
  percentileRank,
  isInRecovery,
  successColor,
  errorColor,
}: FocusScoreCardContentProps) {
  const isPositiveChange = scoreChange > 0;
  const isNegativeChange = scoreChange < 0;
  const padding = size === 'small' ? 14 : size === 'large' ? 18 : 16;
  return (
    <Pressable
      accessibilityHint="Opens Focus Score details"
      accessibilityLabel={`Focus Score ${currentScore}`}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={handlePress}
    >
      <Animated.View style={[animatedStyles]}>
        <GlassCard padding={padding} radius={22} variant="default">
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: size === 'large' ? 44 : size === 'small' ? 28 : 36,
                  fontWeight: '800',
                  letterSpacing: -0.9,
                  lineHeight: size === 'large' ? 48 : size === 'small' ? 32 : 40,
                }}
              >
                {currentScore || '---'}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Focus Score
              </Text>
            </View>

            {currentBand && (
              <GlassPill label={currentBand.label} size="sm" variant="success" />
            )}
          </View>

          {showTrend && scoreChange !== 0 && (
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isPositiveChange
                    ? successColor
                    : isNegativeChange
                      ? errorColor
                      : undefined,
                }}
              >
                {isPositiveChange ? '↑' : '↓'} {Math.abs(scoreChange)} from
                last check
              </Text>
            </View>
          )}

          {isInRecovery && (
            <View
              style={{
                backgroundColor: 'rgba(223, 164, 74, 0.14)',
                borderRadius: 14,
                marginTop: 12,
                padding: 10,
              }}
            >
              <Text style={{ color: vexLightGlass.semantic.warning, fontSize: 12, fontWeight: '700' }}>
                Recovery Mode: +50% XP bonus active
              </Text>
            </View>
          )}

          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              fontStyle: 'italic',
              lineHeight: 19,
              marginTop: 12,
            }}
          >
            {identityStatement}
          </Text>

          {percentileRank && (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 8,
              }}
            >
              Top {100 - percentileRank}% of users
            </Text>
          )}

          <View
            style={{
              height: 4,
              backgroundColor: 'rgba(16, 35, 31, 0.08)',
              borderRadius: 2,
              marginTop: 12,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: scoreColor,
                width: `${scoreProgress * 100}%`,
              }}
            />
          </View>

          {currentBand && currentBand.max < 850 && (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 4,
                textAlign: 'right',
              }}
            >
              {currentBand.max + 1 - currentScore} points to{' '}
              {getNextBandLabel(currentBand.label)}
            </Text>
          )}
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
}
