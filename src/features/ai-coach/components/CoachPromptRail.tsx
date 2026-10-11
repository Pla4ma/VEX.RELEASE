import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

const PROMPTS = [
  { label: 'Plan my next block', prompt: 'Plan my next focus block from what you know about me.' },
  { label: 'Turn material into study', prompt: 'Help me turn my study material into a practical study path.' },
  { label: 'Recover my rhythm', prompt: 'I have lost momentum. Give me a gentle recovery plan for today.' },
  { label: 'Explain my signal', prompt: 'Explain what my recent focus signal says and what I should change.' },
] as const;

type CoachPromptRailProps = {
  onSelect: (prompt: string) => void;
};

export function CoachPromptRail({ onSelect }: CoachPromptRailProps): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing[2], paddingBottom: theme.spacing[2], paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[3] }}>
      <Text color={vexFire.textMuted} variant="label">START WITH A SIGNAL</Text>
      <ScrollView contentContainerStyle={{ gap: theme.spacing[2] }} horizontal showsHorizontalScrollIndicator={false}>
        {PROMPTS.map((item) => (
          <Pressable
            accessibilityHint={`Adds the prompt: ${item.prompt}`}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            key={item.label}
            onPress={() => onSelect(item.prompt)}
            style={({ pressed }) => ({ alignItems: 'center', backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, justifyContent: 'center', minHeight: theme.spacing[10], opacity: pressed ? 0.78 : 1, paddingHorizontal: theme.spacing[3] })}
          >
            <Text color={vexFire.cream} variant="caption">{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
