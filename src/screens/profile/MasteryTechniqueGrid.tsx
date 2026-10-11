import React from 'react';
import { View } from 'react-native';
import { Card } from '../../components/primitives/Card';
import { Text } from '../../components/primitives/Text';
import { TechniqueBar } from '../../features/mastery/components/TechniqueBar';
import type { MasteryState } from '../../features/mastery/types';
import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '@/theme/tokens/vex-fire';


export const TECHNIQUES = [
  {
    key: 'durationMastery' as const,
    label: 'Duration Focus',
    color: vexFire.ember,
    description: 'Long sessions without interruption',
  },
  {
    key: 'purityMastery' as const,
    label: 'Purity',
    color: vexFire.amber,
    description: 'Sustained high focus scores',
  },
  {
    key: 'consistencyMastery' as const,
    label: 'Consistency',
    color: vexFire.ember,
    description: 'Daily streaks maintained',
  },
  {
    key: 'comebackMastery' as const,
    label: 'Comeback',
    color: vexFire.danger,
    description: 'Recovering from broken streaks',
  },
  {
    key: 'bossMastery' as const,
    label: 'Boss',
    color: vexFire.amber,
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
      style={{ backgroundColor: vexFire.panel }}
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
              color={vexFire.textMuted}
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
