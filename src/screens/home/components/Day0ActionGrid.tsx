import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { type } from '../../reference-ui/referenceTokens';
import type { Day0Mode } from '../services/day0-agent-schemas';
import { DAY0_ACTIONS } from './day0ActionData';

interface Day0ActionGridProps {
  onSelect: (mode: Day0Mode) => void;
}

export function Day0ActionGrid({ onSelect }: Day0ActionGridProps): React.ReactNode {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }}>
      {DAY0_ACTIONS.map((action) => (
        <Pressable
          accessibilityHint={action.body}
          accessibilityLabel={`Start ${action.title}`}
          accessibilityRole="button"
          key={action.id}
          onPress={(): void => onSelect(action.id)}
          style={({ pressed }) => ({
            flexBasis: '47%',
            flexGrow: 1,
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          })}
        >
          <ReferenceCard accent="fire" showAsset={false} style={{ flex: 1 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: vexLightGlass.background.atmosphericFire,
                borderColor: vexLightGlass.glass.border,
                borderRadius: borderRadius.lg,
                borderWidth: 1,
                justifyContent: 'center',
                ...getMinTouchTargetStyle(),
              }}
            >
              <Icon
                color={vexLightGlass.semantic.fireDeep}
                name={action.icon}
                size="md"
              />
            </View>
            <Text style={[type.kicker, { marginTop: spacing[3] }]}>
              {action.eyebrow}
            </Text>
            <Text style={[type.title, { marginTop: spacing[1] }]}>
              {action.title}
            </Text>
            <Text style={[type.body, { marginTop: spacing[1] }]}>
              {action.body}
            </Text>
          </ReferenceCard>
        </Pressable>
      ))}
    </View>
  );
}
