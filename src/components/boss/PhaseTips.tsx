import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './BossPhaseIndicator.styles';

type BossPhase = string;

const PHASE_TIPS: Record<string, string[]> = {
  PHASE_1: [
    'Focus on maintaining high purity',
    'Save your pause time for emergencies',
    'Build momentum for later phases',
  ],
  PHASE_2: [
    'Uninterrupted focus required',
    'Commit to uninterrupted focus',
    'Use Deep Work mode if available',
  ],
  PHASE_3: [
    'Final phase — maintain 90%+ purity',
    'Maintain 90%+ purity',
    'Two-minute countdown — finish strong',
    'Your streak is on the line',
  ],
  ENRAGED: [
    'Phase intensity increased',
    'Focus now or fail',
  ],
  EXECUTE: ['Final window', 'FINAL PUSH REQUIRED', 'All or nothing'],
};

export const PhaseTips: React.ComponentType<{ phase: BossPhase }> = ({ phase }) => {
  const phaseTips = PHASE_TIPS[phase] ?? PHASE_TIPS.PHASE_1 ?? [];
  return (
    <View>
      <Text style={styles.tipsHeader}>Phase Tips:</Text>
      {phaseTips.map((tip: string) => (
        <Text key={tip} style={styles.tip}>
          {' '}
          • {tip}
        </Text>
      ))}
    </View>
  );
};
