/**
 * QuickActionsRail
 *
 * Secondary actions on Home screen - 3 quick options below the hero card.
 *
 * @phase 1 - Foundation
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useHaptics } from '../../../utils/haptics';


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
    color: '#3b82f6', // Blue
    action: 'focus',
  },
  {
    id: 'study',
    icon: 'book-open',
    label: 'Study',
    color: '#6366f1', // Indigo
    action: 'study',
  },
  {
    id: 'boss',
    icon: 'zap',
    label: 'Boss',
    color: '#7c3aed', // Purple
    action: 'boss',
  },
];

export function QuickActionsRail({
  onAction,
}: QuickActionsRailProps): JSX.Element {
  const { theme } = useTheme();
  const haptics = useHaptics();

  const containerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: theme.spacing[3],
  };

  const actionButtonStyle = {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  };

  const iconContainerStyle = {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[2],
  };

  const labelStyle = {
    textAlign: 'center' as const,
  };

  const handlePress = (action: QuickAction) => {
    haptics.medium();
    onAction(action.action);
  };

  return (
    <View style={containerStyle}>
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => handlePress(action)}
          style={({ pressed }) => [
            actionButtonStyle,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          android_ripple={{ color: theme.colors.primary[100] }}
        >
          <View
            style={[
              iconContainerStyle,
              { backgroundColor: `${action.color}15` },
            ]}
          >
            <Icon name={action.icon} size={24} color={action.color} />
          </View>
          <Text
            variant="label"
            style={labelStyle}
            color={theme.colors.text.primary}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
