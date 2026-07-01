import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { type } from '../../reference-ui/referenceTokens';
import type { Day0Mode } from '../services/day0-agent-schemas';
import { DAY0_ACTIONS, type Day0Action } from './day0ActionData';

interface Day0ActionGridProps {
  onSelect: (mode: Day0Mode) => void;
  onOpenCoach: () => void;
}

type NavItem = Day0Action | {
  id: 'coach';
  title: string;
  eyebrow: string;
  body: string;
};

export function Day0ActionGrid({
  onOpenCoach,
  onSelect,
}: Day0ActionGridProps): React.ReactNode {
  const items: NavItem[] = [
    ...DAY0_ACTIONS.filter((action) => action.id !== 'focus'),
    {
      id: 'coach',
      title: 'Coach',
      eyebrow: 'AI guide',
      body: 'Open the AI coach.',
    },
  ];

  return (
    <View style={{ gap: spacing[3], marginBottom: spacing[5] }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={type.kicker}>Navigation</Text>
        <Text style={[type.body, { color: vexLightGlass.text.tertiary }]}>
          choose next
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] }}>
        {items.map((item) => (
          <NavTextButton
            item={item}
            key={item.id}
            onOpenCoach={onOpenCoach}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

function NavTextButton({
  item,
  onOpenCoach,
  onSelect,
}: {
  item: NavItem;
  onOpenCoach: () => void;
  onSelect: (mode: Day0Mode) => void;
}): React.ReactNode {
  const handlePress = (): void => {
    if (item.id === 'coach') {
      onOpenCoach();
      return;
    }
    onSelect(item.id);
  };
  return (
    <Pressable
      accessibilityHint={item.body}
      accessibilityLabel={`Open ${item.title}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => ({
        minHeight: 44,
        opacity: pressed ? 0.64 : 1,
        transform: [{ translateY: pressed ? 1 : 0 }],
      })}
    >
      <Text
        style={[
          type.title,
          {
            color: vexLightGlass.text.primary,
            fontFamily: 'Urbanist_800ExtraBold',
            fontSize: 22,
            letterSpacing: 0,
          },
        ]}
      >
        {item.title}
      </Text>
      <Text
        style={[
          type.body,
          {
            color: vexLightGlass.text.tertiary,
            fontFamily: 'Urbanist_600SemiBold',
            fontSize: 13,
          },
        ]}
      >
        {item.eyebrow}
      </Text>
    </Pressable>
  );
}
