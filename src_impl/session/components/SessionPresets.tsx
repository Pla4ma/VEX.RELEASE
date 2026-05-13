/**
 * Session Presets
 *
 * Grid of preset configurations for quick session selection.
 * Includes default presets and user custom presets.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { useSessionPresets } from '../hooks/useSession';
import type { SessionPreset } from '../types';
import { createSheet } from '@/shared/ui/create-sheet';

interface SessionPresetsProps {
  userId: string;
  onSelectPreset: (preset: SessionPreset) => void;
  onCreateCustom?: () => void;
}

export const SessionPresets: React.FC<SessionPresetsProps> = ({
  userId: _userId,
  onSelectPreset,
  onCreateCustom: _onCreateCustom,
}) => {
  const { presets, createPreset, deletePreset } = useSessionPresets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDuration, setNewPresetDuration] = useState('25');

  const categories = ['All', 'Focus', 'Study', 'Work', 'Creative', 'Health'];

  const filteredPresets = selectedCategory && selectedCategory !== 'All'
    ? presets.filter((p: SessionPreset) => p.category === selectedCategory || (selectedCategory === 'Focus' && !p.category))
    : presets;

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      createPreset({
        name: newPresetName,
        duration: parseInt(newPresetDuration) * 60,
        category: 'custom',
      });
      setShowCreateModal(false);
      setNewPresetName('');
      setNewPresetDuration('25');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(category => (
          <Pressable
            key={category}
            style={({ pressed }) => [
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setSelectedCategory(category === 'All' ? null : category)}
            accessibilityLabel={`${category} button`}
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Presets Grid */}
      <ScrollView style={styles.presetsContainer}>
        <View style={styles.grid}>
          {filteredPresets.map((preset: SessionPreset) => (
            <Pressable
              key={preset.id}
              style={({ pressed }) => [styles.presetCard, pressed && { opacity: 0.8 }]}
              onPress={() => onSelectPreset(preset)}
              onLongPress={() => !preset.isDefault && deletePreset(preset.id)}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <View style={styles.presetIcon}>
                <Text style={styles.iconText}>
                  {preset.category === 'Study' ? '📚' :
                   preset.category === 'Work' ? '💼' :
                   preset.category === 'Creative' ? '🎨' :
                   preset.category === 'Health' ? '💪' : '🎯'}
                </Text>
              </View>
              <Text style={styles.presetName} numberOfLines={1}>{preset.name}</Text>
              <Text style={styles.presetDuration}>{formatDuration(preset.duration)}</Text>
              <Text style={styles.presetDetails}>
                {preset.intervals} {preset.intervals > 1 ? 'intervals' : 'interval'}
              </Text>
              {preset.strictMode && (
                <View style={styles.strictBadge}>
                  <Text style={styles.strictText}>Strict</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Create Custom Button */}
        <Pressable
          style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.8 }]}
          onPress={() => setShowCreateModal(true)}
          accessibilityLabel="+ Create Custom Preset button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.createButtonText}>+ Create Custom Preset</Text>
        </Pressable>
      </ScrollView>

      {/* Create Preset Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Custom Preset</Text>

            <Text style={styles.inputLabel}>Preset Name</Text>
            <TextInput
              style={styles.input}
              value={newPresetName}
              onChangeText={setNewPresetName}
              placeholder="e.g., Deep Work"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={newPresetDuration}
              onChangeText={setNewPresetDuration}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor="#666"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.cancelButton, pressed && { opacity: 0.8 }]}
                onPress={() => setShowCreateModal(false)}
                accessibilityLabel="Cancel button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalButton, styles.createConfirmButton, pressed && { opacity: 0.8 }]}
                onPress={handleCreatePreset}
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
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#e94560',
  },
  categoryChipText: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  presetsContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 4,
  },
  presetCard: {
    width: '48%',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  presetIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#e9456020',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  presetDuration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e94560',
    marginBottom: 4,
  },
  presetDetails: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  strictBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  strictText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    margin: 16,
    padding: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e94560',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9E9E9E',
  },
  cancelButtonText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontWeight: '600',
  },
  createConfirmButton: {
    backgroundColor: '#e94560',
  },
  createButtonTextConfirm: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionPresets;

export * from "./SessionPresets.types";
export * from "./SessionPresets.types";
