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
import { useTheme } from '../../../theme/ThemeContext';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { DifficultySuggestion } from '../service/adaptiveDifficulty';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { BannerStats } from './BannerStats';

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
  const accentColor = isUpgrade
    ? theme.colors.success.DEFAULT
    : theme.colors.warning.DEFAULT;
  const iconBg = isUpgrade
    ? `${theme.colors.success[500]}28`
    : `${theme.colors.warning[500]}28`;

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
          borderWidth: 1,
          borderColor: rgbaColors.rgb_255_255_255_0_85,
          overflow: 'hidden',
        }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTopLeftRadius: theme.borderRadius.lg,
            borderTopRightRadius: theme.borderRadius.lg,
            backgroundColor: accentColor,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing[2],
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing[2],
              backgroundColor: iconBg,
            }}
          >
            <Text style={{ fontSize: 16 }}>{isUpgrade ? '📈' : '📊'}</Text>
          </View>
          <Text
            variant="heading3"
            style={{ color: accentColor, fontWeight: '700' }}
          >
            {isUpgrade ? 'Ready for a Challenge?' : 'Difficulty Suggestion'}
          </Text>
        </View>

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

        <BannerStats
          sessionsAnalyzed={stats.sessionsAnalyzed}
          averageGrade={stats.averageGrade}
          averagePurity={stats.averagePurity}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
          <Button
            onPress={() => onAccept(suggestedDifficulty)}
            variant="primary"
            style={{ flex: 1 }}
            accessibilityLabel={`Switch to ${suggestedDifficulty} difficulty`}
            accessibilityRole="button"
            accessibilityHint="Accepts the suggested difficulty change"
          >
            <Text>Switch to {suggestedDifficulty}</Text>
          </Button>
          <Button
            onPress={onDismiss}
            variant="secondary"
            accessibilityLabel="Keep current difficulty"
            accessibilityRole="button"
            accessibilityHint="Declines the suggested difficulty change"
          >
            <Text>Keep Current</Text>
          </Button>
        </View>

        <ConfidenceIndicator confidence={confidence} />
      </Box>
    </Animated.View>
  );
}
