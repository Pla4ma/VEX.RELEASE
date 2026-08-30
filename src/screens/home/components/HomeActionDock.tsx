import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { useTheme } from '../../../theme/ThemeContext';

export type HomeSheet = 'coach' | 'progress' | 'unlocks';

const actions: readonly { id: HomeSheet; label: string; mark: string }[] = [
  { id: 'coach', label: 'Coach', mark: '⌁' },
  { id: 'progress', label: 'Progress', mark: '↗' },
  { id: 'unlocks', label: 'Unlocks', mark: '✦' },
];

interface HomeActionDockProps {
  showUnlocks: boolean;
  onOpen: (sheet: HomeSheet) => void;
}

export function HomeActionDock({ showUnlocks, onOpen }: HomeActionDockProps): React.JSX.Element {
  const { theme } = useTheme();
  const visibleActions = showUnlocks ? actions : actions.filter((action) => action.id !== 'unlocks');
  return (
    <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[4], padding: theme.spacing[2] }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
        {visibleActions.map((action) => (
          <Pressable accessibilityHint={`Open ${action.label.toLowerCase()} sheet`} accessibilityLabel={`${action.label} home action`} accessibilityRole="button" key={action.id} onPress={() => onOpen(action.id)} style={({ pressed }) => ({ alignItems: 'center', backgroundColor: pressed ? theme.colors.surface.pressed : theme.colors.surface.card, borderColor: theme.colors.border.DEFAULT, borderRadius: theme.borderRadius.md, flex: 1, gap: theme.spacing[1], justifyContent: 'center', minHeight: 60, opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ color: theme.colors.primary[500], fontSize: theme.typography.heading.h5.fontSize, fontWeight: theme.fontWeights.heavy }}>{action.mark}</Text>
            <Text variant="caption">{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </VexSurface>
  );
}
