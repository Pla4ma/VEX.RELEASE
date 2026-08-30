import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { Day0Mode } from '../services/day0-agent-schemas';

interface Day0ActionGridProps {
  onSelect: (mode: Day0Mode) => void;
  onOpenCoach: () => void;
}

interface RitualAction {
  id: Day0Mode;
  icon: string;
  subtitle: string;
  title: string;
}

const ACTIONS: RitualAction[] = [
  { id: 'focus', icon: 'flame', subtitle: '25 minutes', title: 'Quick focus' },
  { id: 'study', icon: 'book', subtitle: 'Your practice', title: 'Rituals' },
  { id: 'create', icon: 'sparkles', subtitle: 'Capture insight', title: 'Reflect' },
];

export function Day0ActionGrid({
  onOpenCoach: _onOpenCoach,
  onSelect,
}: Day0ActionGridProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginBottom: theme.spacing[6], zIndex: 1 }}>
      {ACTIONS.map((item) => (
        <Pressable
          accessibilityHint={`Opens ${item.title}`}
          accessibilityLabel={item.title}
          accessibilityRole="button"
          key={item.id}
          onPress={() => onSelect(item.id)}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: pressed ? theme.colors.surface.pressed : theme.colors.background.secondary,
            borderColor: theme.colors.border.light,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            flex: 1,
            minHeight: theme.spacing[24] + theme.spacing[16],
            paddingHorizontal: theme.spacing[2],
            paddingVertical: theme.spacing[3],
            ...getMinTouchTargetStyle(),
          })}
        >
          <View style={{ alignItems: 'center', borderColor: theme.colors.semantic.primary, borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[10], justifyContent: 'center', width: theme.spacing[10] }}>
            <VexIcon color={theme.colors.semantic.primary} name={item.icon} size="sm" variant="outline" />
          </View>
          <Text color={theme.colors.text.secondary} variant="h5" style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontWeight: theme.fontWeights.regular, letterSpacing: 1.5, marginTop: theme.spacing[2], textAlign: 'center', textTransform: 'uppercase' }}>
            {item.title}
          </Text>
          <Text color={theme.colors.text.tertiary} variant="caption" style={{ marginTop: theme.spacing[1], textAlign: 'center', textTransform: 'uppercase' }}>
            {item.subtitle}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
