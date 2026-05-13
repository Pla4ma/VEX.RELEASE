/**
 * Recovery Prompt
 *
 * Modal displayed when session recovery is available.
 * Shows recovery options and their consequences.
 */

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import type { RecoveryType } from '../types';
import { createSheet } from '@/shared/ui/create-sheet';

interface RecoveryOption {
  type: RecoveryType;
  label: string;
  description: string;
  icon: string;
  penalty: string;
  available: boolean;
}

interface RecoveryPromptProps {
  isVisible: boolean;
  sessionId: string;
  timeLost: number;
  onSelect: (type: RecoveryType) => void;
  onAbandon: () => void;
  hasStreakSave: boolean;
  streakDays: number;
}

export const RecoveryPrompt: React.FC<RecoveryPromptProps> = ({
  isVisible,
  sessionId: _sessionId,
  timeLost,
  onSelect,
  onAbandon,
  hasStreakSave,
  streakDays,
}) => {
  const recoveryOptions: RecoveryOption[] = [
    {
      type: 'AUTO_RESUME',
      label: 'Auto Resume',
      description: 'Continue from where you left',
      icon: '▶️',
      penalty: 'None - if resumed quickly',
      available: timeLost < 300, // Available if less than 5 minutes lost
    },
    {
      type: 'USER_RESUME',
      label: 'Manual Resume',
      description: 'Resume with minor penalty',
      icon: '👆',
      penalty: '-10% score penalty',
      available: true,
    },
    {
      type: 'STREAK_SAVE',
      label: 'Use Streak Save',
      description: `Protect your ${streakDays}-day streak`,
      icon: '🔥',
      penalty: 'Consumes 1 streak save',
      available: hasStreakSave,
    },
    {
      type: 'PARTIAL_CREDIT',
      label: 'Take Partial Credit',
      description: 'Get credit for completed time',
      icon: '💰',
      penalty: '50% XP & coins only',
      available: timeLost > 0,
    },
  ];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🔄</Text>
            <Text style={styles.title}>Session Interrupted</Text>
            <Text style={styles.subtitle}>
              {formatTime(timeLost)} of focus time was lost
            </Text>
          </View>

          {/* Recovery Options */}
          <Text style={styles.sectionTitle}>Choose Recovery Option:</Text>

          <View style={styles.options}>
            {recoveryOptions
              .filter(opt => opt.available)
              .map(option => (
                <Pressable
                  key={option.type}
                  style={({ pressed }) => [styles.optionCard, pressed && { opacity: 0.8 }]}
                  onPress={() => onSelect(option.type)}
                  accessibilityLabel="Interactive control"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.penaltyBadge}>
                    <Text style={styles.penaltyText}>{option.penalty}</Text>
                  </View>
                </Pressable>
              ))}
          </View>

          {/* Alternative: Abandon */}
          <View style={styles.abandonSection}>
            <Text style={styles.orText}>— or —</Text>
            <Pressable
              style={({ pressed }) => [styles.abandonButton, pressed && { opacity: 0.8 }]}
              onPress={onAbandon}
              accessibilityLabel="Abandon Session button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.abandonText}>Abandon Session</Text>
              <Text style={styles.abandonPenalty}>
                Lose all progress & streak risk
              </Text>
            </Pressable>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Select the best option based on how much time you lost and your current streak status.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E9E9E',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  options: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  penaltyBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  penaltyText: {
    fontSize: 12,
    color: '#f44336',
  },
  abandonSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  orText: {
    color: '#666',
    marginBottom: 12,
  },
  abandonButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 8,
    alignItems: 'center',
  },
  abandonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  abandonPenalty: {
    fontSize: 12,
    color: '#e9456080',
    marginTop: 4,
  },
  helpText: {
    marginTop: 20,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RecoveryPrompt;

export * from "./RecoveryPrompt.types";
export * from "./RecoveryPrompt.types";
