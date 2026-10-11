import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import type { FocusModeCard } from '../../../features/session-start/navigation-schemas';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface FocusModeRailProps {
  cards: FocusModeCard[];
  onPress: (card: FocusModeCard) => void;
}

function artFor(card: FocusModeCard): ImageSourcePropType {
  if (card.mode === 'STUDY') return require('../../../../assets/vex/session/study-mark.png');
  if (card.mode === 'LIGHT_FOCUS') return require('../../../../assets/vex/session/recovery-mark.png');
  return require('../../../../assets/vex/session/sprint-mark.png');
}

function descriptionFor(card: FocusModeCard): string {
  if (card.mode === 'SPRINT') return 'Short, bright pressure.';
  if (card.mode === 'STUDY') return 'Long-form, quiet depth.';
  if (card.mode === 'LIGHT_FOCUS') return 'Balanced, sustained attention.';
  return 'Restore clarity before you return.';
}

export function FocusModeRail({ cards, onPress }: FocusModeRailProps): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing[3], marginTop: theme.spacing[5] }}>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View><Text color={vexFire.amber} variant="label" style={{ letterSpacing: 2.5 }}>Choose your mode</Text><Text color={vexFire.textSecondary} variant="bodySmall" style={{ marginTop: theme.spacing[1] }}>Start where your attention is.</Text></View>
        <Text color={vexFire.textMuted} variant="caption">{cards.length} paths</Text>
      </View>
      {cards.map((card, index) => (
        <Pressable accessibilityHint={card.accessibilityHint} accessibilityLabel={card.accessibilityLabel} accessibilityRole="button" key={card.id} onPress={() => onPress(card)} style={({ pressed }) => ({ ...getMinTouchTargetStyle(), opacity: pressed ? 0.82 : 1, transform: [{ translateX: pressed ? theme.spacing[1] : 0 }] })}>
          <View style={{ backgroundColor: index === 0 ? vexFire.backgroundRaised : vexFire.panelSoft, borderColor: index === 0 ? vexFire.ember : vexFire.border, borderRadius: theme.borderRadius.xl, borderWidth: 1, flexDirection: 'row', minHeight: theme.spacing[20], overflow: 'hidden' }}>
            <View style={{ alignItems: 'center', borderRightColor: vexFire.line, borderRightWidth: 1, justifyContent: 'center', width: theme.spacing[20] }}><Image accessibilityIgnoresInvertColors resizeMode="contain" source={artFor(card)} style={{ height: theme.spacing[16], width: theme.spacing[16] }} /></View>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><Text color={index === 0 ? vexFire.ember : vexFire.amber} style={{ fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.heading.h5.fontSize, letterSpacing: 2.2 }} variant="label">{card.title}</Text><Text color={vexFire.ember} style={{ fontSize: theme.typography.heading.h3.fontSize }}>›</Text></View>
              <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2] }}><Text color={vexFire.textSecondary} style={{ flex: 1 }} variant="bodySmall">{descriptionFor(card)}</Text><Text color={vexFire.amber} variant="label" style={{ marginLeft: theme.spacing[3] }}>{Math.round(card.durationSeconds / 60)} min</Text></View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
