import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { type } from '../../reference-ui/referenceTokens';
import type { Day0Mode } from '../services/day0-agent-schemas';
import { DAY0_ACTIONS, type Day0Action } from './day0ActionData';

interface Day0ActionGridProps {
  onSelect: (mode: Day0Mode) => void;
}

interface Day0ActionRowProps {
  action: Day0Action;
  onSelect: (mode: Day0Mode) => void;
}

function Day0ActionRow({
  action,
  onSelect,
}: Day0ActionRowProps): React.ReactNode {
  return (
    <Pressable
      accessibilityHint={action.body}
      accessibilityLabel={`Start ${action.title}`}
      accessibilityRole="button"
      onPress={(): void => onSelect(action.id)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: vexLightGlass.glass.fillStrong,
          borderColor: vexLightGlass.glass.border,
          borderRadius: borderRadius.xl,
          borderWidth: 1,
          flexDirection: 'row',
          gap: spacing[3],
          minHeight: 92,
          padding: spacing[3],
          shadowColor: vexLightGlass.glass.shadow,
          shadowOffset: { height: 5, width: 0 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: vexLightGlass.mint[100],
            borderColor: vexLightGlass.glass.border,
            borderRadius: borderRadius.full,
            borderWidth: 1,
            height: 52,
            justifyContent: 'center',
            width: 52,
            ...getMinTouchTargetStyle(),
          }}
        >
          <Icon
            color={vexLightGlass.mint[800]}
            name={action.icon}
            size="md"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type.kicker, { color: vexLightGlass.text.tertiary }]}>
            {action.eyebrow}
          </Text>
          <Text style={[type.title, { marginTop: spacing[1] }]}>
            {action.title}
          </Text>
          <Text
            numberOfLines={2}
            style={[type.body, { marginTop: spacing[1] }]}
          >
            {action.body}
          </Text>
        </View>
        <Icon color={vexLightGlass.text.tertiary} name="arrowRight" size="sm" />
      </View>
    </Pressable>
  );
}

export function Day0ActionGrid({ onSelect }: Day0ActionGridProps): React.ReactNode {
  const secondaryActions = DAY0_ACTIONS.filter((action) => action.id !== 'focus');

  return (
    <View style={{ gap: spacing[3] }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={type.kicker}>OTHER STARTS</Text>
        <Text style={[type.body, { color: vexLightGlass.text.tertiary }]}>
          Choose shape
        </Text>
      </View>
      {secondaryActions.map((action) => (
        <Day0ActionRow
          action={action}
          key={action.id}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

