import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { styles } from '../styles';
import { getStarterPresetsForDisplay } from './starter-presets';

type StarterStepProps = {
  starterPresetId: string | undefined;
  onSelectPreset: (presetId: string) => void;
};

export function StarterStep({
  starterPresetId,
  onSelectPreset,
}: StarterStepProps): React.ReactNode {
  const { theme } = useTheme();
  const [showMoreOptions, setShowMoreOptions] = useState(
    starterPresetId === 'deep',
  );
  const presets = getStarterPresetsForDisplay(showMoreOptions);

  return (
    <View style={styles.section}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Start with something you can finish.
      </Text>
      <Text
        style={[styles.stepSubtitle, { color: theme.colors.text.secondary }]}
      >
        You can tune everything later. Right now the fastest value is one
        completed session.
      </Text>
      <View style={styles.choiceGrid}>
        {presets.map((preset) => {
          const isSelected = starterPresetId === preset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => onSelectPreset(preset.id)}
              style={[
                styles.choiceCard,
                {
                  backgroundColor: isSelected
                    ? `${theme.colors.primary[500]}18`
                    : theme.colors.background.secondary,
                  borderColor: isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.border.DEFAULT,
                },
              ]}
              accessibilityLabel={`Choose ${preset.title}`}
              accessibilityRole="button"
              accessibilityHint="Selects this starter focus session"
            >
              <View style={styles.presetHeader}>
                <Text
                  style={[
                    styles.choiceTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {preset.title}
                </Text>
                <Text
                  style={[
                    styles.presetPill,
                    { color: theme.colors.primary[500] },
                  ]}
                >
                  {preset.durationLabel}
                </Text>
              </View>
              <Text
                style={[
                  styles.choiceDescription,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {preset.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!showMoreOptions ? (
        <Pressable
          onPress={() => setShowMoreOptions(true)}
          accessibilityLabel="Show longer first-session options"
          accessibilityRole="button"
          accessibilityHint="Reveals longer starter sessions for users who already have more time"
        >
          <Text
            style={[styles.stepSubtitle, { color: theme.colors.primary[500] }]}
          >
            More options
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
