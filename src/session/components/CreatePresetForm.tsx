import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

import { buttonTap } from '../../utils/haptics';

interface CreatePresetFormProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, durationSeconds: number) => void;
}

export const CreatePresetForm: React.ComponentType<CreatePresetFormProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('25');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name, parseInt(duration) * 60);
      setName('');
      setDuration('25');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Custom Preset</Text>

              <Text style={styles.inputLabel}>Preset Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Deep Work"
                placeholderTextColor={lightColors.text.muted}
                accessibilityLabel="Preset name"
                accessibilityHint="Enter a name for your custom session preset"
              />

              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={lightColors.text.muted}
                accessibilityLabel="Duration in minutes"
                accessibilityHint="Enter the session duration in minutes"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.cancelButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={onClose}
                  accessibilityLabel="Cancel preset creation"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to activate"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    styles.createConfirmButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => { buttonTap(); handleCreate(); }}
                  accessibilityLabel="Create custom preset"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to activate"
                >
                  <Text style={styles.createButtonTextConfirm}>Create</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: lightColors.semantic.background,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: lightColors.text.inverse,
    marginBottom: 20,
  },
  inputLabel: { fontSize: 14, color: lightColors.text.muted, marginBottom: 8 },
  input: {
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 8,
    padding: 12,
    color: lightColors.text.inverse,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.semantic.border,
  },
  modalButtons: { flexDirection: 'row' as const, gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightColors.text.muted,
  },
  cancelButtonText: {
    color: lightColors.text.muted,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  createConfirmButton: { backgroundColor: lightColors.semantic.danger },
  createButtonTextConfirm: {
    color: lightColors.text.inverse,
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
