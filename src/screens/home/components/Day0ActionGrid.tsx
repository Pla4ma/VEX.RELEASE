import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { vexFire } from '../../../theme/tokens/vex-fire';
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

const COACH_ARTIFACT = require('../../../../assets/vex/coach/coach-artifact.png');

export function Day0ActionGrid({
  onOpenCoach,
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
            backgroundColor: pressed ? vexFire.backgroundSoft : vexFire.panelSoft,
            borderColor: vexFire.border,
            borderRadius: theme.borderRadius.md,
            borderWidth: 1,
            flex: 1,
            minHeight: theme.spacing[24] + theme.spacing[16],
            paddingHorizontal: theme.spacing[2],
            paddingVertical: theme.spacing[3],
            ...getMinTouchTargetStyle(),
          })}
        >
          <View style={{ alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, height: theme.spacing[10], justifyContent: 'center', width: theme.spacing[10] }}>
            <VexIcon color={vexFire.ember} name={item.icon} size="sm" variant="outline" />
          </View>
          <Text color={vexFire.textSecondary} variant="h5" style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontWeight: theme.fontWeights.regular, letterSpacing: 1.5, marginTop: theme.spacing[2], textAlign: 'center', textTransform: 'uppercase' }}>
            {item.title}
          </Text>
          <Text color={vexFire.textMuted} variant="caption" style={{ marginTop: theme.spacing[1], textAlign: 'center', textTransform: 'uppercase' }}>
            {item.subtitle}
          </Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityHint="Opens a conversation with VEX Coach"
        accessibilityLabel="Ask VEX Coach"
        accessibilityRole="button"
        onPress={onOpenCoach}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed ? vexFire.backgroundSoft : vexFire.panel,
          borderColor: vexFire.borderStrong,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1,
          flex: 1,
          minHeight: theme.spacing[24] + theme.spacing[16],
          paddingHorizontal: theme.spacing[2],
          paddingVertical: theme.spacing[3],
          ...getMinTouchTargetStyle(),
        })}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Coach compass artifact"
          source={COACH_ARTIFACT}
          resizeMode="contain"
          style={{ height: theme.spacing[10], width: theme.spacing[10] }}
        />
        <Text color={vexFire.cream} variant="h5" style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontWeight: theme.fontWeights.regular, letterSpacing: 1.5, marginTop: theme.spacing[2], textAlign: 'center', textTransform: 'uppercase' }}>
          Ask Coach
        </Text>
        <Text color={vexFire.textMuted} variant="caption" style={{ marginTop: theme.spacing[1], textAlign: 'center', textTransform: 'uppercase' }}>
          Find your next move
        </Text>
      </Pressable>
    </View>
  );
}
