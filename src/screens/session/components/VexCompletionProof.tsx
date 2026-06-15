import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';

import { VexMotionSurface } from '../../../components/primitives/VexMotionSurface';
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { VexProofRing } from './VexProofRing';
import { lightColors } from '@/theme/tokens/colors';

interface ProofLineProps {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}

function ProofLine({ label, value, highlight }: ProofLineProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <Text variant="body" color="textSecondary">
        {label}
      </Text>
      <Text
        variant="body"
        color={highlight ? 'vexCyan' : 'textPrimary'}
        style={{ fontWeight: highlight ? '600' : '400' }}
      >
        {value}
      </Text>
    </View>
  );
}

interface VexCompletionProofProps {
  grade: string;
  durationMinutes: number;
  purityPercent: number;
  streakDays: number;
  streakIncremented: boolean;
  testID?: string;
}

export function VexCompletionProof({
  grade,
  durationMinutes,
  purityPercent,
  streakDays,
  streakIncremented,
  testID,
}: VexCompletionProofProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const entering = isReducedMotion ? undefined : FadeInUp.duration(500);

  return (
    <View testID={testID} style={{ flex: 1 }}>
      {/* Warm background */}
      <LinearGradient
        colors={[lightColors.semantic.obsidian, 'rgba(255,179,0,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <Animated.View
        entering={entering}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing[6],
          gap: theme.spacing[6],
        }}
      >
        {/* Proof Ring */}
        <VexProofRing grade={grade} size={180} delay={600} />

        {/* Proof Lines */}
        <VexMotionSurface
          variant="glass"
          style={{ width: '100%', padding: theme.spacing[5] }}
        >
          <ProofLine
            icon="clock"
            label="Duration"
            value={`${durationMinutes} minutes`}
          />
          <ProofLine
            icon="shield"
            label="Purity"
            value={`${purityPercent}%`}
          />
          <ProofLine
            icon="streak"
            label="Streak"
            value={streakIncremented ? `${streakDays - 1} → ${streakDays}` : `${streakDays} days`}
            highlight={streakIncremented}
          />
        </VexMotionSurface>
      </Animated.View>
    </View>
  );
}
