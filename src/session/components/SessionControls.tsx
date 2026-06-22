import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { styles } from './session-controls.styles';
import { sessionStart, sessionPause, sessionResume, buttonTap } from '../../utils/haptics';

interface SessionControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
  disabled?: boolean;
}
export const SessionControls: React.FC<SessionControlsProps> = ({
  isActive,
  isPaused,
  onStart,
  onPause,
  onResume,
  onAbandon,
  disabled = false,
}) => {
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false);
  const handleAbandon = () => {
    setShowConfirmAbandon(false);
    buttonTap();
    onAbandon();
  };
  const handleStart = () => {
    sessionStart();
    onStart();
  };
  const handlePause = () => {
    sessionPause();
    onPause();
  };
  const handleResume = () => {
    sessionResume();
    onResume();
  };
  if (!isActive) {
    return (
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.startButton,
            disabled && styles.disabled,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleStart}
          disabled={disabled}
          accessibilityLabel="Start session"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.buttonText}>▶ Start Session</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {isPaused ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.resumeButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleResume}
            accessibilityLabel="Resume session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.buttonText}>▶ Resume</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.pauseButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handlePause}
            accessibilityLabel="Pause session"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.abandonButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => setShowConfirmAbandon(true)}
          accessibilityLabel="Abandon session"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.buttonText}>✕ Abandon</Text>
        </Pressable>
      </View>

      {}
      <Modal
        visible={showConfirmAbandon}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmAbandon(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Abandon Session?</Text>
            <Text style={styles.modalText}>
              This will count as a failed session and may affect your streak.
              Are you sure?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.cancelButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setShowConfirmAbandon(false)}
                accessibilityLabel="Continue Session"
                accessibilityRole="button"
                accessibilityHint="Cancels abandonment and continues the session"
              >
                <Text style={styles.cancelButtonText}>Continue Session</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.confirmAbandonButton,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleAbandon}
                accessibilityLabel="Yes, Abandon"
                accessibilityRole="button"
                accessibilityHint="Confirms abandoning this session permanently"
              >
                <Text style={styles.buttonText}>Yes, Abandon</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export { SessionControls }