/**
 * FocusStats — three pill labels for elapsed / total / percent-done.
 */
import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusStatsProps {
  elapsedSeconds: number;
  totalSeconds: number;
  percentage: number;
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={{ alignItems: 'center', minWidth: 56 }}>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 18,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.tertiary,
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 1.6,
          marginTop: 2,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Divider(): React.JSX.Element {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.18)',
        height: 24,
        width: 1,
      }}
    />
  );
}

export function FocusStats({
  elapsedSeconds,
  totalSeconds,
  percentage,
}: FocusStatsProps): React.JSX.Element {
  const elapsed = `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60)
    .toString()
    .padStart(2, '0')}`;
  const total = `${Math.round(totalSeconds / 60)} min`;
  const done = `${Math.round(percentage)}%`;

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing[4],
        marginTop: spacing[8],
      }}
    >
      <StatPill label="elapsed" value={elapsed} />
      <Divider />
      <StatPill label="of" value={total} />
      <Divider />
      <StatPill label="done" value={done} />
    </View>
  );
}
