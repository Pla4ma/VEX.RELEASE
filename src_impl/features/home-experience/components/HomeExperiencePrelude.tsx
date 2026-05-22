import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useOnboardingStore } from '../../onboarding/store';
import type { ExplicitMotivationStyle, HomeExperienceModel } from '../schemas';

const OPTIONS: Array<{ label: string; value: ExplicitMotivationStyle }> = [
  { label: 'Calm', value: 'calm' },
  { label: 'Study-focused', value: 'study_focused' },
  { label: 'Game-like', value: 'game_like' },
  { label: 'Coach-led', value: 'coach_led' },
  { label: 'Intense', value: 'intense' },
];

interface HomeExperiencePreludeProps {
  model: HomeExperienceModel;
}

export function HomeExperiencePrelude({ model }: HomeExperiencePreludeProps): JSX.Element {
  const { theme } = useTheme();
  const selected = useOnboardingStore((state) => state.explicitMotivationStyle);
  const setStyle = useOnboardingStore((state) => state.setExplicitMotivationStyle);

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <View style={{ gap: theme.spacing[1] }}>
        <Text variant="label" color="text.secondary">AI Coach</Text>
        <Text variant="body" color="text.primary">{model.aiCoachMessageStyle}</Text>
      </View>
      {model.visibleSections.includes('motivation_style') ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setStyle(option.value)}
              accessibilityLabel={`Choose ${option.label} motivation style`}
              accessibilityRole="button"
              accessibilityHint="Personalizes Home copy and keeps the first session available"
              style={{
                backgroundColor: selected === option.value
                  ? theme.colors.primary[500]
                  : theme.colors.background.secondary,
                borderColor: theme.colors.border.light,
                borderRadius: theme.borderRadius.md,
                borderWidth: 1,
                minHeight: 44,
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[2],
              }}
            >
              <Text
                variant="bodySmall"
                color={selected === option.value ? 'text.inverse' : 'text.primary'}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[4],
        }}
      >
        <Text variant="label" color="text.secondary">Next evolution</Text>
        <Text variant="body" color="text.primary">{model.teasedElements[0]?.copy}</Text>
      </View>
    </View>
  );
}
