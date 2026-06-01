import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '../../components/primitives';
import { TechniqueBar } from '../../features/mastery/components/TechniqueBar';
import type { MasteryState } from '../../features/mastery/types';
import { useTheme } from '../../theme';


export const TECHNIQUES = [
  {
    key: 'durationMastery' as const,
    label: 'Duration Focus',
    color: '#6366f1',
    description: 'Long sessions without interruption',
  },
  {
    key: 'purityMastery' as const,
    label: 'Purity',
    color: '#14b8a6',
    description: 'Sustained high focus scores',
  },
  {
    key: 'consistencyMastery' as const,
    label: 'Consistency',
    color: '#f97316',
    description: 'Daily streaks maintained',
  },
  {
    key: 'comebackMastery' as const,
    label: 'Comeback',
    color: '#ec4899',
    description: 'Recovering from broken streaks',
  },
  {
    key: 'bossMastery' as const,
    label: 'Boss',
    color: '#eab308',
    description: 'Boss defeat efficiency',
  },
] as const;

export function MasteryTechniqueGrid({
  state,
}: {
  state: MasteryState;
}): JSX.Element {
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
