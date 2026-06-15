/**
 * Adaptive Difficulty Banner
 *
 * Displays personalized difficulty suggestions based on recent performance.
 * Shows in SessionSetupScreen when the user qualifies for a difficulty change.
 */

import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { DifficultySuggestion } from '../service/adaptiveDifficulty';

import { ConfidenceIndicator } from './ConfidenceIndicator';

type SessionDifficulty = 'CASUAL' | 'FOCUSED' | 'INTENSE';

interface AdaptiveDifficultyBannerProps {
  suggestion: DifficultySuggestion | null;
  onDismiss: () => void;
  onAccept: (difficulty: SessionDifficulty) => void;
  visible: boolean;
}

export function AdaptiveDifficultyBanner({
  suggestion,
  onDismiss,
  onAccept,
  visible,
}: AdaptiveDifficultyBannerProps): JSX.Element | null {
  const { theme } = useTheme();

  if (!visible || !suggestion || !suggestion.suggestion) {
    return null;
  }

  const {
    suggestion: suggestedDifficulty,
    reason,
    confidence,
    stats,
  } = suggestion;

  const isUpgrade = confidence === 'high' || stats.averageGrade >= 4.5;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      exiting={FadeOutUp.duration(300)}
      style={{ marginBottom: theme.spacing[4] }}
    >
      <Box
        backgroundColor={isUpgrade ? 'success' : 'warning'}
        borderRadius="lg"
        padding="lg"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: isUpgrade
            ? theme.colors.success.DEFAULT
            : theme.colors.warning.DEFAULT,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing[2],
          }}
        >
          <Text style={{ fontSize: 20, marginRight: theme.spacing[2] }}>
            {isUpgrade ? '📈' : '📊'}
          </Text>
          <Text
            variant="heading3"
            style={{
              color: isUpgrade
                ? theme.colors.success.DEFAULT
                : theme.colors.warning.DEFAULT,
              fontWeight: '700',
            }}
          >
            {isUpgrade ? 'Ready for a Challenge?' : 'Difficulty Suggestion'}
          </Text>
        </View>

        {/* Reason */}
        <Text
          variant="body"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[3],
            lineHeight: 20,
          }}
        >
          {reason}
        </Text>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing[4],
            marginBottom: theme.spacing[3],
            padding: theme.spacing[3],
            backgroundColor: rgbaColors.rgb_255_255_255_0_1,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <View>
            <Text
              variant="caption"
              style={{ color: theme.colors.text.secondary }}
            >
              Sessions Analyzed
            </Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {stats.sessionsAnalyzed}
            </Text>
          </View>
          <View>
            <Text
              variant="caption"
              style={{ color: theme.colors.text.secondary }}
            >
              Average Grade
            </Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {stats.averageGrade.toFixed(1)}
            </Text>
          </View>
          <View>
            <Text
              variant="caption"
              style={{ color: theme.colors.text.secondary }}
            >
              Purity Score
            </Text>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {Math.round(stats.averagePurity)}%
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
          <Button
            <Text>onPress={() => onAccept(suggestedDifficulty)}</Text>
            variant="primary"
            style={{ flex: 1 }}
          >
            Switch to {suggestedDifficulty}
          </Button>
          <Button onPress={onDismiss} variant="secondary">
            <Text>Keep Current</Text>
          </Button>
        </View>

        {/* Confidence indicator */}
        <ConfidenceIndicator confidence={confidence} />
      </Box>
    </Animated.View>
  );
}
