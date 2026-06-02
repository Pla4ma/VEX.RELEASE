/**
 * Streak Insurance Prompt
 *
 * Displays a banner prompting users to purchase streak insurance
 * when they have a streak >= 3 days and no active insurance.
 *
 * @phase 6 - Monetization Depth
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';


interface StreakInsurancePromptProps {
  streakDays: number;
  insuranceCost?: number;
  userCoins: number;
  onPurchase: () => void;
  onDismiss: () => void;
}

export const StreakInsurancePrompt: React.FC<StreakInsurancePromptProps> = ({
  streakDays,
  insuranceCost = 200,
  userCoins,
  onPurchase,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const canAfford = userCoins >= insuranceCost;

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🛡️</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Your {streakDays}-day streak is at risk
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            Protect it for {insuranceCost} coins?
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onPurchase}
            disabled={!canAfford}
            style={({ pressed }) => [
              styles.purchaseButton,
              {
                backgroundColor: canAfford
                  ? pressed
                    ? theme.colors.primary[600]
                    : theme.colors.primary[500]
                  : theme.colors.background.tertiary,
                opacity: canAfford ? 1 : 0.5,
              },
            ]}
            accessibilityLabel="Purchase streak insurance"
            accessibilityRole="button"
            accessibilityHint={`Costs ${insuranceCost} coins`}
          >
            <Text style={styles.buttonText}>
              {canAfford ? 'Protect' : 'Too expensive'}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityLabel="Dismiss streak insurance prompt"
            accessibilityRole="button"
            accessibilityHint="Will not show again for 24 hours"
          >
            <Text
              style={[
                styles.dismissText,
                { color: theme.colors.text.tertiary },
              ]}
            >
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>

      {!canAfford && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            You need {insuranceCost - userCoins} more coins
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = createSheet({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e94560',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(233,69,96,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  actions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  purchaseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dismissText: {
    fontSize: 12,
  },
  warningBanner: {
    backgroundColor: 'rgba(233,69,96,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  warningText: {
    color: '#e94560',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StreakInsurancePrompt;
