import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import type { RescueEligibilityResult } from '../schemas';

interface RescueBannerProps {
  eligibility: RescueEligibilityResult;
  onStartRescue: () => void;
  onDismiss: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function RescueBanner({
  eligibility,
  onStartRescue,
  onDismiss,
  accessibilityLabel = 'Rescue mode available. Tap to start a short focus block.',
  accessibilityHint = 'Opens a low-pressure 5 to 12 minute rescue session.',
}: RescueBannerProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  if (!eligibility.eligible) return null;

  const minutes = Math.round(eligibility.recommendedDurationSeconds / 60);

  return (
    <View
      style={{
        marginHorizontal: theme.spacing[4],
        marginVertical: theme.spacing[2],
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.lg,
        backgroundColor: colors.semantic.primarySoft,
        borderWidth: 1,
        borderColor: colors.semantic.primary,
        gap: theme.spacing[2],
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: colors.semantic.primary,
        }}
        accessibilityRole="header"
      >
        Small step, big impact
      </Text>

      <Text
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: colors.semantic.textPrimary,
        }}
      >
        A {minutes}-minute rescue block is available. No pressure, no judgment — just
        one small action to keep moving forward.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing[3],
          marginTop: theme.spacing[1],
        }}
      >
        <Pressable
          onPress={onStartRescue}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.md,
            backgroundColor: colors.semantic.primary,
            opacity: pressed ? 0.85 : 1,
            alignItems: 'center' as const,
            minHeight: 44,
            justifyContent: 'center' as const,
          })}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text.inverse,
            }}
          >
            Start {minutes} min
          </Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss rescue mode suggestion"
          accessibilityHint="Hides the rescue mode banner for now."
          style={({ pressed }) => ({
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.md,
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center' as const,
          })}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: colors.semantic.textMuted,
            }}
          >
            Not now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
