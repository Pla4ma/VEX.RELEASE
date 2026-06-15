import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { borderRadius, spacing } from '../../../theme/tokens';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { type } from '../../reference-ui/referenceTokens';
import { Day0Mascot } from './Day0Mascot';

interface Day0VexOsCardProps {
  completedActions: number;
}

export function Day0VexOsCard({
  completedActions,
}: Day0VexOsCardProps): JSX.Element {
  const osPercent = Math.min(19, 5 + completedActions * 7);

  return (
    <ReferenceCard accent="fire" showAsset={false}>
      <View style={{ flexDirection: 'row', gap: spacing[4] }}>
        <View style={{ flex: 1 }}>
          <Text style={type.kicker}>VEX OS</Text>
          <Text style={[type.hero, { marginTop: spacing[2], maxWidth: 230 }]}>
            {osPercent}% online.
          </Text>
          <Text style={[type.body, { marginTop: spacing[2], maxWidth: 260 }]}>
            Choose your first signal. Focus is one path, not the only path.
          </Text>
        </View>
        <Day0Mascot size={92} />
      </View>

      <View
        style={{
          backgroundColor: vexLightGlass.glass.borderSubtle,
          borderRadius: borderRadius.full,
          height: 8,
          marginTop: spacing[4],
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: vexLightGlass.semantic.fire,
            borderRadius: borderRadius.full,
            height: '100%',
            width: `${osPercent}%`,
          }}
        />
      </View>
      <Text
        style={[
          type.body,
          {
            color: vexLightGlass.semantic.fireDeep,
            fontWeight: '800',
            marginTop: spacing[2],
          },
        ]}
      >
        {completedActions}/4 first signals started
      </Text>
    </ReferenceCard>
  );
}
