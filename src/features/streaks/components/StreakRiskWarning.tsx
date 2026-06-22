/**
 * Streak Risk Warning
 *
 * Alert component for at-risk streaks.
 *
 * @phase 5 - Deepening: Risk warning UI
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


interface StreakRiskWarningProps {
  streak: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hoursRemaining: number;
  onStartSession: () => void;
  onDismiss?: () => void;
}

export function StreakRiskWarning({
  streak,
  riskLevel,
  hoursRemaining,
  onStartSession,
  onDismiss,
}: StreakRiskWarningProps): React.ReactNode {
  const getMessage = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return `Your ${streak}-day streak ends in ${Math.floor(hoursRemaining)} hours!`;
      case 'HIGH':
        return `Save your ${streak}-day streak - ${Math.floor(hoursRemaining)} hours left`;
      case 'MEDIUM':
        return 'Keep your momentum going!';
      default:
        return "Don't forget to focus today";
    }
  };

  const getColor = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return lightColors.semantic.danger;
      case 'HIGH':
        return lightColors.semantic.warning;
      case 'MEDIUM':
        return lightColors.semantic.warning;
      default:
        return lightColors.semantic.success;
    }
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, { borderLeftColor: getColor() }]}
    >
      <View style={styles.content}>
        <Text style={[styles.emoji, { color: getColor() }]}>
          {riskLevel === 'CRITICAL' ? '🔥' : riskLevel === 'HIGH' ? '⚡' : '💪'}
        </Text>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: getColor() },
          pressed && { opacity: 0.8 },
        ]}
        onPress={onStartSession}
        accessibilityLabel="Start focus session"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Text style={styles.buttonText}>Start Session</Text>
      </Pressable>

      {onDismiss && (
        <Pressable
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.8 }]}
          onPress={onDismiss}
          accessibilityLabel="Dismiss streak warning"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = createSheet({
  container: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: lightColors.text.inverse,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: lightColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  dismiss: {
    marginTop: 8,
    alignItems: 'center',
  },
  dismissText: {
    color: lightColors.text.muted,
    fontSize: 13,
  },
});

export { StreakRiskWarning }