import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { spacing, borderRadius } from '../../../theme/tokens';
import type { HomeUnlockPathItem } from '../services/home-unlock-path-schemas';
import type { MilestoneState } from './MilestoneNode';

export function MilestoneProgress({
  item,
  state,
}: {
  item: HomeUnlockPathItem;
  state: MilestoneState;
}): JSX.Element | null {
  if (state === 'unlocked') {
    return (
      <Text
        style={{
          color: vexLightGlass.mint[800],
          fontSize: 11,
          fontWeight: '800',
          marginTop: spacing[2],
        }}
      >
        Unlocked
      </Text>
    );
  }
  const progress = Math.min(1, item.current / item.requirement);
  return (
    <View style={{ marginTop: spacing[2] }}>
      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 5,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <View
          style={{
            backgroundColor:
              state === 'current'
                ? vexLightGlass.semantic.fire
                : vexLightGlass.mint[700],
            borderRadius: borderRadius.full,
            height: '100%',
            opacity: state === 'locked' ? 0.35 : 1,
            width: `${progress * 100}%`,
          }}
        />
      </View>
      <Text
        style={{
          color:
            state === 'current'
              ? vexLightGlass.semantic.fireDeep
              : vexLightGlass.text.tertiary,
          fontSize: 10,
          fontWeight: '800',
          marginTop: spacing[1],
        }}
      >
        {item.current}/{item.requirement} sessions
      </Text>
    </View>
  );
}
