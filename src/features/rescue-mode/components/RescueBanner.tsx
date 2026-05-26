import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { spacing } from '../../../theme/tokens/spacing';
import { borderRadius } from '../../../theme/tokens/radius';
import type { RescueEligibilityResult } from '../schemas';

const BANNER_BG = 'rgba(91, 77, 255, 0.08)';
const BANNER_BORDER = 'rgba(91, 77, 255, 0.18)';
const TEXT_PRIMARY = '#334155';
const TEXT_ACCENT = '#4F46E5';
const TEXT_MUTED = '#64748B';

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
  if (!eligibility.eligible) return null;

  const minutes = Math.round(eligibility.recommendedDurationSeconds / 60);

  return (
    <View
      style={{
        marginHorizontal: spacing[4],
        marginVertical: spacing[2],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        backgroundColor: BANNER_BG,
        borderWidth: 1,
        borderColor: BANNER_BORDER,
        gap: spacing[2],
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: TEXT_ACCENT,
        }}
        accessibilityRole="header"
      >
        Small step, big impact
      </Text>

      <Text
        style={{
          fontSize: 13,
          lineHeight: 18,
          color: TEXT_PRIMARY,
        }}
      >
        A {minutes}-minute rescue block is available. No pressure, no judgment — just
        one small action to keep moving forward.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing[3],
          marginTop: spacing[1],
        }}
      >
        <Pressable
          onPress={onStartRescue}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            borderRadius: borderRadius.md,
            backgroundColor: '#4F46E5',
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
              color: '#FFFFFF',
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
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            borderRadius: borderRadius.md,
            opacity: pressed ? 0.6 : 1,
            minHeight: 44,
            justifyContent: 'center' as const,
          })}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '500',
              color: TEXT_MUTED,
            }}
          >
            Not now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
