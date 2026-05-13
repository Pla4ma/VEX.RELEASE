/**
 * Interruption Warning
 *
 * Overlay displayed when interruption risk is detected.
 * Shows countdown and recovery options.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';

interface InterruptionWarningProps {
  isVisible: boolean;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  countdownSeconds: number;
  interruptionType: string;
  onResume: () => void;
  onAbandon: () => void;
  onUseStreakSave?: () => void;
  hasStreakSave?: boolean;
}

export const InterruptionWarning: React.FC<InterruptionWarningProps> = ({
  isVisible,
  severity,
  countdownSeconds,
  interruptionType,
  onResume,
  onAbandon,
  onUseStreakSave,
  hasStreakSave = false,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(countdownSeconds);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      setRemainingSeconds(countdownSeconds);
    }
  }, [isVisible, countdownSeconds]);

  useEffect(() => {
    if (!isVisible || remainingSeconds <= 0) {return;}

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, remainingSeconds]);

  // Pulse animation for urgency
  useEffect(() => {
    if (isVisible && remainingSeconds <= 10) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 120 });
    }
  }, [isVisible, remainingSeconds, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const getSeverityColor = (): string => {
    switch (severity) {
      case 'CRITICAL': return '#f44336';
      case 'MAJOR': return '#FF6B35';
      case 'MODERATE': return '#FFA500';
      case 'MINOR': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getSeverityMessage = (): string => {
    switch (severity) {
      case 'CRITICAL':
        return 'Session will be lost! Resume immediately!';
      case 'MAJOR':
        return 'Significant disruption detected';
      case 'MODERATE':
        return 'Your focus is at risk';
      case 'MINOR':
        return 'Brief interruption detected';
      default:
        return 'Session interruption';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            pulseStyle,
          ]}
        >
          {/* Warning Icon */}
          <View style={[styles.iconContainer, { backgroundColor: getSeverityColor() }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Interruption Detected</Text>

          {/* Type */}
          <Text style={styles.interruptionType}>{interruptionType}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: getSeverityColor() }]}>
            {getSeverityMessage()}
          </Text>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <Text style={[styles.countdown, { color: getSeverityColor() }]}>
              {formatTime(remainingSeconds)}
            </Text>
            <Text style={styles.countdownLabel}>until session expires</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(remainingSeconds / countdownSeconds) * 100}%`,
                  backgroundColor: getSeverityColor(),
                },
              ]}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.resumeButton, pressed && { opacity: 0.8 }]}
              onPress={onResume}
              accessibilityLabel="▶ Resume Session button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.buttonText}>▶ Resume Session</Text>
            </Pressable>

            {hasStreakSave && onUseStreakSave && (
              <Pressable
                style={({ pressed }) => [styles.button, styles.streakSaveButton, pressed && { opacity: 0.8 }]}
                onPress={onUseStreakSave}
                accessibilityLabel="🔥 Use Streak Save button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                <Text style={styles.buttonText}>🔥 Use Streak Save</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [styles.button, styles.abandonButton, pressed && { opacity: 0.8 }]}
              onPress={onAbandon}
              accessibilityLabel="Abandon Session button"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Text style={styles.abandonButtonText}>Abandon Session</Text>
            </Pressable>
          </View>

          {/* Penalty Warning */}
          {severity === 'CRITICAL' && (
            <Text style={styles.penaltyWarning}>
              ⚠️ Abandoning will result in streak loss and score penalty
            </Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = createSheet({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  interruptionType: {
    fontSize: 16,
    color: '#9E9E9E',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdown: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  streakSaveButton: {
    backgroundColor: '#FF6B35',
  },
  abandonButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  abandonButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  penaltyWarning: {
    marginTop: 16,
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
  },
});

export default InterruptionWarning;

export * from "./InterruptionWarning.types";
export * from "./InterruptionWarning.types";
