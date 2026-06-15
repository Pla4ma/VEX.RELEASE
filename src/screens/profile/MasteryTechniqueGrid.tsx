import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '../../components/primitives/Card';
import { TechniqueBar } from '../../features/mastery/components/TechniqueBar';
import type { MasteryState } from '../../features/mastery/types';
import { useTheme } from '../../theme/ThemeContext';
import { lightColors } from '@/theme/tokens/colors';


export const TECHNIQUES = [
  {
    key: 'durationMastery' as const,
    label: 'Duration Focus',
    color: lightColors.semantic.primary,
    description: 'Long sessions without interruption',
  },
  {
    key: 'purityMastery' as const,
    label: 'Purity',
    color: lightColors.accent.teal,
    description: 'Sustained high focus scores',
  },
  {
    key: 'consistencyMastery' as const,
    label: 'Consistency',
    color: lightColors.accent.orange,
    description: 'Daily streaks maintained',
  },
  {
    key: 'comebackMastery' as const,
    label: 'Comeback',
    color: lightColors.accent.pink,
    description: 'Recovering from broken streaks',
  },
  {
    key: 'bossMastery' as const,
    label: 'Boss',
    color: lightColors.semantic.warning,
    description: 'Boss defeat efficiency',
  },
] as const;

export function MasteryTechniqueGrid({
  state,
}: {
  state: MasteryState;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Card
      size="md"
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      <View style={{ gap: theme.spacing[4] }}>
        {TECHNIQUES.map((tech) => (
          <View key={tech.key}>
            <TechniqueBar
              label={tech.label}
              value={state.techniques[tech.key]}
              max={25}
              color={tech.color}
            />
            <Text
              variant="caption"
              color="text.tertiary"
              style={{ marginTop: theme.spacing[1] }}
            >
              {tech.description}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
