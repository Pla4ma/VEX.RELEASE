import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSessionPresets } from '../hooks/useSession';
import type { SessionPreset } from '../types';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

import { PresetCard } from './PresetCard';
import { CreatePresetForm } from './CreatePresetForm';
import { cardSelection } from '../../utils/haptics';

interface SessionPresetsProps {
  userId: string;
  onSelectPreset: (preset: SessionPreset) => void;
  onCreateCustom?: () => void;
}

const categories = ['All', 'Focus', 'Study', 'Work', 'Creative', 'Health'];

export const SessionPresets: React.FC<SessionPresetsProps> = ({
  userId: _userId,
  onSelectPreset,
  onCreateCustom: _onCreateCustom,
}) => {
  const { presets, createPreset, deletePreset } = useSessionPresets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPresets =
    selectedCategory && selectedCategory !== 'All'
      ? presets.filter(
          (p) =>
            p.category === selectedCategory ||
            (selectedCategory === 'Focus' && !p.category),
        )
      : presets;

  const handleCreatePreset = (name: string, durationSeconds: number) => {
    createPreset({
      name,
      duration: durationSeconds,
      category: 'custom',
    });
    setShowCreateModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <Pressable
            key={category}
            style={({ pressed }) => [
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() =>
              setSelectedCategory(category === 'All' ? null : category)
            }
            accessibilityLabel={`Select ${category} category`}
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.presetsContainer}>
        <View style={styles.grid}>
          {filteredPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={(preset) => { cardSelection(); onSelectPreset(preset); }}
              onDelete={deletePreset}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => { cardSelection(); setShowCreateModal(true); }}
          accessibilityLabel="Create custom preset"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          <Text style={styles.createButtonText}>+ Create Custom Preset</Text>
        </Pressable>
      </ScrollView>

      <CreatePresetForm
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePreset}
      />
    </View>
  );
};

const styles = createSheet({
  container: { flex: 1 },
  categoryScroll: { maxHeight: 50, marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: lightColors.semantic.backgroundElevated,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: lightColors.semantic.danger },
  categoryChipText: {
    color: lightColors.text.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: { color: lightColors.text.inverse },
  presetsContainer: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 4 },
  createButton: {
    margin: 16,
    padding: 16,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: lightColors.semantic.danger,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: lightColors.semantic.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionPresets;
