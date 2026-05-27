import React, { useState } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";
import { launchColors } from "@theme/tokens/launch-colors";

interface CreatePresetFormProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, durationSeconds: number) => void;
}

export const CreatePresetForm: React.FC<CreatePresetFormProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("25");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name, parseInt(duration) * 60);
      setName("");
      setDuration("25");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Custom Preset</Text>

          <Text style={styles.inputLabel}>Preset Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Deep Work"
            placeholderTextColor={launchColors.hex_666}
          />

          <Text style={styles.inputLabel}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor={launchColors.hex_666}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onClose}
              accessibilityLabel="Cancel button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                styles.createConfirmButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleCreate}
              accessibilityLabel="Create button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.createButtonTextConfirm}>Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: launchColors.rgb_0_0_0_0_7,
    justifyContent: "center" as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: launchColors.hex_1a1a2e,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: launchColors.hex_fff,
    marginBottom: 20,
  },
  inputLabel: { fontSize: 14, color: launchColors.hex_9e9e9e, marginBottom: 8 },
  input: {
    backgroundColor: launchColors.hex_2a2a3e,
    borderRadius: 8,
    padding: 12,
    color: launchColors.hex_fff,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: launchColors.hex_3a3a4e,
  },
  modalButtons: { flexDirection: "row" as const, gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: launchColors.hex_9e9e9e,
  },
  cancelButtonText: {
    color: launchColors.hex_9e9e9e,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  createConfirmButton: { backgroundColor: launchColors.hex_e94560 },
  createButtonTextConfirm: {
    color: launchColors.hex_fff,
    fontSize: 16,
    fontWeight: "600" as const,
  },
};
