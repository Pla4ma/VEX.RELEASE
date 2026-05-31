/**
 * RecallQuestionCard Component
 *
 * Shows single recall/reflection question after study block completion.
 * Displays prompt, optional answerHint, and handles user dismissal.
 */
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { cardSelection } from '../../../utils/haptics';
import type { RecallQuestion } from '../schemas';

export interface RecallQuestionCardProps {
  question: RecallQuestion;
  onDismiss: () => void;
  /** Called when user taps "Review" — optional next-action */
  onReview?: () => void;
}

export function RecallQuestionCard({
  question,
  onDismiss,
  onReview,
}: RecallQuestionCardProps): JSX.Element {
  const { theme } = useTheme();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {return <></>;}

  const handleDismiss = () => {
    cardSelection();
    setDismissed(true);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(200)}
    >
      <Box
        p={4}
        borderRadius="lg"
        style={{
          backgroundColor: theme.colors.surface.card,
          borderWidth: 1,
          borderColor: theme.colors.accent.purple,
          borderLeftWidth: 4,
        }}
      >
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text variant="label" color="accent.purple" textTransform="uppercase">
            {question.kind === 'reflection' ? 'Reflection' : 'Recall'}
          </Text>
          <Pressable
            onPress={handleDismiss}
            accessibilityLabel="Dismiss recall question"
            accessibilityRole="button"
          >
            <Text variant="bodySmall" color="text.muted">
              ✕
            </Text>
          </Pressable>
        </Box>

        <Text variant="bodyLarge" color="text.primary" mt={2}>
          {question.prompt}
        </Text>

        {question.answerHint ? (
          <Text variant="bodySmall" color="text.secondary" mt={1}>
            Hint: {question.answerHint}
          </Text>
        ) : null}

        <Box flexDirection="row" mt={3}>
          <Pressable
            onPress={handleDismiss}
            style={{ flex: 1 }}
            accessibilityLabel="Dismiss recall question"
            accessibilityRole="button"
          >
            <Box
              p={2}
              borderRadius="md"
              alignItems="center"
              style={{ backgroundColor: theme.colors.surface.button }}
            >
              <Text variant="button" color="text.secondary">
                Done
              </Text>
            </Box>
          </Pressable>
          {onReview ? (
            <Box ml={2} style={{ flex: 1 }}>
              <Pressable
                onPress={() => { cardSelection(); onReview(); }}
                accessibilityLabel="Review question in study session"
                accessibilityRole="button"
              >
                <Box
                  p={2}
                  borderRadius="md"
                  alignItems="center"
                  style={{ backgroundColor: theme.colors.semantic.primarySoft }}
                >
                  <Text variant="button" color="semantic.primary">
                    Review
                  </Text>
                </Box>
              </Pressable>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Animated.View>
  );
}
