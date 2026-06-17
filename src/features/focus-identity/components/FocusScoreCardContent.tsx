import React from 'react';
import { View, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Text } from '../../../components/primitives/Text';
import { borderRadius } from '../../../theme/tokens/radius';
import { rgbaColors } from '../../../theme/tokens/rgba-colors';
import { spacing } from '../../../theme/tokens/spacing';
import { typography } from '../../../theme/tokens/typography';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
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
  const padding = size === 'small' ? spacing[3] : size === 'large' ? spacing[5] : spacing[4];
  const scoreType =
    size === 'large'
      ? typography.display.large
      : size === 'small'
        ? typography.display.small
        : typography.display.medium;
  return (
    <Pressable
      accessibilityHint="Opens Focus Score details"
      accessibilityLabel={`Focus Score ${currentScore || 'not yet scored'}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      accessibilityValue={{ max: currentBand?.max, min: 0, now: currentScore }}
      disabled={!onPress}
      onPress={handlePress}
      style={getMinTouchTargetStyle()}
    >
      <Animated.View style={animatedStyles}>
        <GlassCard padding={padding} radius={borderRadius['2xl']} variant="default">
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
                  ...scoreType,
                }}
              >
                {currentScore || '---'}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: typography.ui.caption.fontSize,
                  fontWeight: typography.ui.caption.fontWeight,
                }}
              >
                Focus Score
              </Text>
            </View>
            {currentBand && <GlassPill label={currentBand.label} size="sm" variant="success" />}
          </View>
          {showTrend && scoreChange !== 0 && (
            <View style={{ marginTop: spacing[2] }}>
              <Text
                style={{
                  fontSize: typography.ui.caption.fontSize,
                  fontWeight: typography.ui.overline.fontWeight,
                  color: isPositiveChange
                    ? successColor
                    : isNegativeChange
                      ? errorColor
                      : undefined,
                }}
              >
                {isPositiveChange ? '+' : '-'}{Math.abs(scoreChange)} from
                last check
              </Text>
            </View>
          )}
          {isInRecovery && (
            <View
              style={{
                backgroundColor: rgbaColors.rgb_224_184_112_0_10,
                borderRadius: borderRadius.lg,
                marginTop: spacing[3],
                padding: spacing[3],
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.semantic.warning,
                  fontSize: typography.ui.caption.fontSize,
                  fontWeight: typography.ui.caption.fontWeight,
                }}
              >
                Recovery Mode: +50% XP bonus active
              </Text>
            </View>
          )}
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: typography.body.small.fontSize,
              fontStyle: 'italic',
              lineHeight: typography.body.small.lineHeight,
              marginTop: spacing[3],
            }}
          >
            {identityStatement}
          </Text>
          {percentileRank !== null && (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: typography.ui.caption.fontSize,
                fontWeight: typography.ui.caption.fontWeight,
                marginTop: spacing[2],
              }}
            >
              Top {100 - percentileRank}% of users
            </Text>
          )}
          <View
            style={{
              height: spacing[1],
              backgroundColor: vexLightGlass.background.mintTrack,
              borderRadius: borderRadius.xs,
              marginTop: spacing[3],
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                borderRadius: borderRadius.xs,
                backgroundColor: scoreColor,
                width: `${scoreProgress * 100}%`,
              }}
            />
          </View>
          {currentBand && currentBand.max < 850 && (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: typography.ui.caption.fontSize,
                fontWeight: typography.ui.caption.fontWeight,
                marginTop: spacing[1],
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
