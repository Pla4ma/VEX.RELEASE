import React from "react";
import { View, Text, Pressable, Alert, Modal } from "react-native";
import { styles } from "./DataExportScreen.styles";

// ─── Types ──────────────────────────────────────────────────────────

export type ExportFormat = "json" | "csv";
export type DataCategory = "sessions" | "analytics" | "achievements" | "settings" | "all";

export interface DataExportScreenProps {
  userId: string;
  onClose?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────

export const CATEGORIES: Array<{ key: DataCategory; label: string; icon: string; description: string }> = [
  { key: "all", label: "Everything", icon: "📦", description: "All your data in one export" },
  { key: "sessions", label: "Sessions", icon: "📅", description: "Session history and stats" },
  { key: "analytics", label: "Analytics", icon: "📊", description: "Charts, trends, and insights" },
  { key: "achievements", label: "Achievements", icon: "🏆", description: "Badges and milestones" },
  { key: "settings", label: "Settings", icon: "⚙️", description: "Preferences and configuration" },
];

export const FORMATS: Array<{ key: ExportFormat; label: string; icon: string; description: string }> = [
  { key: "json", label: "JSON", icon: "📄", description: "Machine-readable, great for backups" },
  { key: "csv", label: "CSV", icon: "📑", description: "Spreadsheet format, easy to analyze" },
];

// ─── Sub-components ─────────────────────────────────────────────────

interface CategorySelectorProps {
  selectedCategory: DataCategory;
  onSelect: (category: DataCategory) => void;
}

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What to Export</Text>
      <View style={styles.optionsGrid}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.key}
            style={({ pressed }) => [
              styles.optionCard,
              selectedCategory === category.key && styles.optionCardSelected,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onSelect(category.key)}
            accessibilityLabel={`${category.label} category button`}
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.optionIcon}>{category.icon}</Text>
            <Text style={[styles.optionLabel, selectedCategory === category.key && styles.optionLabelSelected]}>
              {category.label}
            </Text>
            <Text style={styles.optionDescription}>{category.description}</Text>
            {selectedCategory === category.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkIcon}>✓</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  onSelect: (format: ExportFormat) => void;
}

export function FormatSelector({ selectedFormat, onSelect }: FormatSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Export Format</Text>
      <View style={styles.formatRow}>
        {FORMATS.map((format) => (
          <Pressable
            key={format.key}
            style={({ pressed }) => [
              styles.formatCard,
              selectedFormat === format.key && styles.formatCardSelected,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onSelect(format.key)}
            accessibilityLabel={`${format.label} format button`}
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text style={styles.formatIcon}>{format.icon}</Text>
            <Text style={[styles.formatLabel, selectedFormat === format.key && styles.formatLabelSelected]}>
              {format.label}
            </Text>
            <Text style={styles.formatDescription}>{format.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function DangerZoneSection() {
  return (
    <View style={styles.dangerSection}>
      <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
      <Text style={styles.dangerDescription}>These actions cannot be undone. Please be certain.</Text>
      <Pressable
        style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.8 }]}
        onPress={() => {
          Alert.alert(
            "Delete All Data?",
            "This will permanently delete all your data including sessions, achievements, and progress. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete My Data",
                style: "destructive",
                onPress: () => {
                  Alert.alert(
                    "Final Confirmation",
                    'Are you absolutely sure? Type "DELETE" to confirm.',
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete Forever", style: "destructive" },
                    ],
                  );
                },
              },
            ],
          );
        }}
        accessibilityLabel="Delete All My Data button"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Text style={styles.dangerButtonText}>Delete All My Data</Text>
      </Pressable>
    </View>
  );
}

interface ConfirmExportModalProps {
  visible: boolean;
  selectedCategory: DataCategory;
  selectedFormat: ExportFormat;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmExportModal({
  visible, selectedCategory, selectedFormat, onClose, onConfirm,
}: ConfirmExportModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirm Export</Text>
          <Text style={styles.modalDescription}>
            We'll prepare your{" "}
            {CATEGORIES.find((c) => c.key === selectedCategory)?.label} data as
            a {selectedFormat.toUpperCase()} file. This may take a few minutes.
          </Text>
          <View style={styles.modalButtons}>
            <Pressable
              style={({ pressed }) => [styles.modalButtonSecondary, pressed && { opacity: 0.8 }]}
              onPress={onClose}
              accessibilityLabel="Cancel button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalButtonPrimary, pressed && { opacity: 0.8 }]}
              onPress={onConfirm}
              accessibilityLabel="Confirm Export button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text style={styles.modalButtonPrimaryText}>Start Export</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
