import React from 'react';
import { View, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { launchColors } from '@theme/tokens/launch-colors';
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
  return (
    <Pressable onPress={handlePress} disabled={!onPress}>
      <Animated.View style={[animatedStyles]}>
        <Box
          padding={size === 'small' ? 'md' : size === 'large' ? 'xl' : 'lg'}
          backgroundColor="surface"
          borderRadius="lg"
          style={{ width: '100%', borderColor: scoreColor, borderWidth: 2 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Text
                variant={
                  size === 'large'
                    ? 'display'
                    : size === 'small'
                      ? 'heading3'
                      : 'heading2'
                }
                color="text"
                style={{ fontWeight: '700', color: scoreColor }}
              >
                {currentScore || '---'}
              </Text>
              <Text variant="caption" color="textMuted">
                Focus Score
              </Text>
            </View>

            {currentBand && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: scoreColor + '20',
                }}
              >
                <Text
                  variant="caption"
                  style={{ fontWeight: '600', color: scoreColor }}
                >
                  {currentBand.label}
                </Text>
              </View>
            )}
          </View>

          {showTrend && scoreChange !== 0 && (
            <View style={{ marginTop: 8 }}>
              <Text
                variant="body"
                style={{
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
            <Box
              padding="sm"
              backgroundColor="warning"
              borderRadius="md"
              style={{ marginTop: 12 }}
            >
              <Text variant="caption" color="warning">
                🔥 Recovery Mode: +50% XP bonus active!
              </Text>
            </Box>
          )}

          <Text
            variant="body"
            color="text"
            style={{ marginTop: 12, fontStyle: 'italic' }}
          >
            {identityStatement}
          </Text>

          {percentileRank && (
            <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
              Top {100 - percentileRank}% of users
            </Text>
          )}

          <View
            style={{
              height: 4,
              backgroundColor: launchColors.hex_e0e0e0,
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
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4, textAlign: 'right' }}
            >
              {currentBand.max + 1 - currentScore} points to{' '}
              {getNextBandLabel(currentBand.label)}
            </Text>
          )}
        </Box>
      </Animated.View>
    </Pressable>
  );
}
