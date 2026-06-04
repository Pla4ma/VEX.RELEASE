/**
 * Tooltip Card Component
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../../components/primitives/Text';
import { useTheme } from '../../../../theme';
import type { TooltipCardProps } from './types';
import { lightColors } from '@/theme/tokens/colors';


export function TooltipCard({
  step,
  onNext,
  onDismiss,
  isLast,
}: TooltipCardProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={{
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[5],
        marginHorizontal: theme.spacing[6],
        maxWidth: 320,
        shadowColor: lightColors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* Icon */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing[4] }}>
        <Text fontSize={48}>{step.icon}</Text>
      </View>

      {/* Title */}
      <Text
        variant="h4"
        color={theme.colors.text.primary}
        textAlign="center"
        fontWeight="700"
        style={{ marginBottom: theme.spacing[2] }}
      >
        {step.title}
      </Text>

      {/* Description */}
      <Text
        variant="body"
        color={theme.colors.text.secondary}
        textAlign="center"
        style={{ marginBottom: theme.spacing[5], lineHeight: 22 }}
      >
        {step.description}
      </Text>

      {/* Buttons */}
      <View style={{ gap: theme.spacing[3] }}>
        <Pressable
          onPress={onNext}
          style={{
            backgroundColor: theme.colors.primary[500],
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[5],
            borderRadius: theme.borderRadius.lg,
            alignItems: 'center',
          }}
          accessibilityLabel="Tooltip"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text
            color={theme.colors.text.inverse}
            fontWeight="600"
            fontSize={16}
          >
            {isLast ? 'Got it!' : 'Next'}
          </Text>
        </Pressable>

        {!isLast && (
          <Pressable
            onPress={onDismiss}
            style={{
              paddingVertical: theme.spacing[2],
              alignItems: 'center',
            }}
            accessibilityLabel="Skip tutorial"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              variant="body"
              color={theme.colors.text.secondary}
              fontWeight="500"
            >
              Skip tutorial
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
