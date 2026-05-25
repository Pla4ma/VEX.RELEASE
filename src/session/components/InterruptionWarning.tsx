import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { launchColors } from '@theme/tokens/launch-colors';
import { styles } from './InterruptionWarning.styles';

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

function getSeverityColor(severity: InterruptionWarningProps['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return launchColors.hex_f44336;
    case 'MAJOR':
      return launchColors.hex_ff6b35;
    case 'MODERATE':
      return launchColors.hex_ffa500;
    case 'MINOR':
      return launchColors.hex_ffc107;
    default:
      return launchColors.hex_9e9e9e;
  }
}

function getSeverityMessage(severity: InterruptionWarningProps['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return 'Resume now to keep this session intact.';
    case 'MAJOR':
      return 'Big pause. You can still return cleanly.';
    case 'MODERATE':
      return 'Take a breath, then come back.';
    case 'MINOR':
      return 'Small pause. Keep the thread.';
    default:
      return 'Focus paused.';
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const InterruptionWarning: React.FC<InterruptionWarningProps> = ({
  countdownSeconds,
  hasStreakSave = false,
  interruptionType,
  isVisible,
  onAbandon,
  onResume,
  onUseStreakSave,
  severity,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(countdownSeconds);
  const pulseAnim = useSharedValue(1);
  const severityColor = getSeverityColor(severity);

  useEffect(() => {
    if (isVisible) {
      setRemainingSeconds(countdownSeconds);
    }
  }, [isVisible, countdownSeconds]);

  useEffect(() => {
    if (!isVisible || remainingSeconds <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible, remainingSeconds]);

  useEffect(() => {
    if (isVisible && remainingSeconds <= 10) {
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true,
      );
    } else {
      pulseAnim.value = withTiming(1, { duration: 120 });
    }
  }, [isVisible, remainingSeconds, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, pulseStyle]}>
          <View style={[styles.iconContainer, { backgroundColor: severityColor }]}>
            <Text style={styles.warningIcon}>!</Text>
          </View>
          <Text style={styles.title}>Focus paused</Text>
          <Text style={styles.interruptionType}>{interruptionType}</Text>
          <Text style={[styles.message, { color: severityColor }]}>
            {getSeverityMessage(severity)}
          </Text>
          <View style={styles.countdownContainer}>
            <Text style={[styles.countdown, { color: severityColor }]}>
              {formatTime(remainingSeconds)}
            </Text>
            <Text style={styles.countdownLabel}>reserved for your return</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(remainingSeconds / countdownSeconds) * 100}%`,
                  backgroundColor: severityColor,
                },
              ]}
            />
          </View>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.resumeButton, pressed && { opacity: 0.8 }]}
              onPress={onResume}
              accessibilityLabel="Resume focus session"
              accessibilityRole="button"
              accessibilityHint="Returns to the active focus timer"
            >
              <Text style={styles.buttonText}>Resume Focus</Text>
            </Pressable>
            {hasStreakSave && onUseStreakSave ? (
              <Pressable
                style={({ pressed }) => [styles.button, styles.streakSaveButton, pressed && { opacity: 0.8 }]}
                onPress={onUseStreakSave}
                accessibilityLabel="Use streak save"
                accessibilityRole="button"
                accessibilityHint="Uses a streak save before ending this session"
              >
                <Text style={styles.buttonText}>Use Streak Save</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.button, styles.abandonButton, pressed && { opacity: 0.8 }]}
              onPress={onAbandon}
              accessibilityLabel="End focus session"
              accessibilityRole="button"
              accessibilityHint="Ends this session and moves to recovery"
            >
              <Text style={styles.abandonButtonText}>End Session</Text>
            </Pressable>
          </View>
          {severity === 'CRITICAL' ? (
            <Text style={styles.penaltyWarning}>Ending now may affect your streak and rewards.</Text>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default InterruptionWarning;
