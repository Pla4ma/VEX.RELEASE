import React from 'react';
import { Pressable, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { spacing } from '../../../theme/tokens/spacing';
import { borderRadius } from '../../../theme/tokens/radius';
import { bodyTypography, fontWeights } from '../../../theme/tokens/typography';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export type HomeSheet = 'coach' | 'progress' | 'unlocks';

const actions: ReadonlyArray<{
  id: HomeSheet;
  label: string;
  icon: 'chat-bubble' | 'chart' | 'lock';
}> = [
  { id: 'coach', label: 'Coach', icon: 'chat-bubble' },
  { id: 'progress', label: 'Progress', icon: 'chart' },
  { id: 'unlocks', label: 'Unlocks', icon: 'lock' },
];

interface HomeActionDockProps {
  showUnlocks: boolean;
  onOpen: (sheet: HomeSheet) => void;
}

export function HomeActionDock({
  showUnlocks,
  onOpen,
}: HomeActionDockProps): React.ReactNode {
  const visibleActions = showUnlocks
    ? actions
    : actions.filter((action) => action.id !== 'unlocks');

  return (
    <GlassCard padding={spacing[2]} radius={32} variant="premium" glowMint>
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {visibleActions.map((action) => (
          <Pressable
            accessibilityHint={`Open ${action.label.toLowerCase()} sheet`}
            accessibilityLabel={`${action.label} home action`}
            accessibilityRole="button"
            key={action.id}
            onPress={() => onOpen(action.id)}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: pressed
                ? vexLightGlass.mint[100]
                : 'rgba(255, 255, 255, 0.44)',
              borderColor: 'rgba(255, 255, 255, 0.76)',
              borderRadius: borderRadius['2xl'],
              borderWidth: 1,
              flex: 1,
              gap: spacing[1],
              minHeight: 68,
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Icon color={vexLightGlass.mint[800]} name={action.icon} size="sm" />
            <Text
              style={[
                bodyTypography.small,
                {
                  color: vexLightGlass.text.primary,
                  fontWeight: fontWeights.heavy,
                  letterSpacing: 0,
                },
              ]}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </GlassCard>
  );
}
