/**
 * QuickActionsRail
 *
 * Secondary actions on Home screen - 3 quick options below the hero card.
 *
 * @phase 1 - Foundation
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Icon } from '../../../icons';
import { useHaptics } from '../../../utils/haptics';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: string;
}

interface QuickActionsRailProps {
  onAction: (action: string) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'focus',
    icon: 'target',
    label: 'Focus',
    color: vexLightGlass.semantic.info,
    action: 'focus',
  },
  {
    id: 'study',
    icon: 'book-open',
    label: 'Study',
    color: vexLightGlass.mint[400],
    action: 'study',
  },
  {
    id: 'boss',
    icon: 'zap',
    label: 'Boss',
    color: vexLightGlass.accent.purple,
    action: 'boss',
  },
];

export function QuickActionsRail({
  onAction,
}: QuickActionsRailProps): JSX.Element {
  const haptics = useHaptics();

  const handlePress = (action: QuickAction) => {
    haptics.medium();
    onAction(action.action);
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => handlePress(action)}
          style={({ pressed }) => [
            { flex: 1 },
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          accessibilityLabel={`${action.label} quick action`}
          accessibilityRole="button"
          accessibilityHint={`Starts a ${action.label.toLowerCase()} session`}
        >
          <GlassCard variant="subtle" padding={14} radius={20} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: `${action.color}18`,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Icon name={action.icon} size={24} color={action.color} />
            </View>
            <Text
              style={{
                textAlign: 'center',
                color: vexLightGlass.text.primary,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {action.label}
            </Text>
          </GlassCard>
        </Pressable>
      ))}
    </View>
  );
}
