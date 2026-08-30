import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import type { FocusModeCard } from '../../../features/session-start/schemas';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

interface FocusModeCardViewProps {
  card: FocusModeCard;
  onPress: () => void;
}

const SPRINT_ART: ImageSourcePropType = require('../../../../assets/vex/focus-sprint-icon.png');
const MODE_ART: Record<string, ImageSourcePropType> = {
  recovery: require('../../../../assets/vex/focus-recovery-icon.png'),
  sprint: SPRINT_ART,
  study: require('../../../../assets/vex/focus-study-icon.png'),
  'light-focus': require('../../../../assets/vex/focus-light-icon.png'),
};

function getModeArt(cardId: string): ImageSourcePropType {
  const mode = cardId.split('-')[0] ?? 'sprint';
  return MODE_ART[mode] ?? SPRINT_ART;
}

function getModeDescription(card: FocusModeCard): string {
  if (card.mode === 'SPRINT') return 'High intensity. Short duration.';
  if (card.mode === 'LIGHT_FOCUS') return 'Sustained attention. Balanced pace.';
  if (card.mode === 'STUDY') return 'Deep work. Longer blocks.';
  return 'Restore clarity. Reset the system.';
}

export function FocusModeCardView({
  card,
  onPress,
}: FocusModeCardViewProps): React.JSX.Element {
  const { theme } = useTheme();
  const isPrimary = card.mode === 'SPRINT';
  const accentColor = card.mode === 'STUDY' ? theme.colors.semantic.secondary : theme.colors.semantic.primary;

  return (
    <Pressable
      accessibilityHint={card.accessibilityHint}
      accessibilityLabel={card.accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        marginBottom: theme.spacing[3],
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        ...getMinTouchTargetStyle(),
      })}
    >
      <View style={{ backgroundColor: theme.colors.background.overlay, borderColor: isPrimary ? theme.colors.semantic.primary : theme.colors.border.DEFAULT, borderRadius: theme.borderRadius.xl, borderWidth: 1, flexDirection: 'row', minHeight: theme.spacing[20], overflow: 'hidden' }}>
        <View style={{ alignItems: 'center', borderRightColor: theme.colors.border.light, borderRightWidth: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[3], width: theme.spacing[20] }}>
          <Image accessibilityIgnoresInvertColors resizeMode="contain" source={getModeArt(card.id)} style={{ height: theme.spacing[16], width: theme.spacing[16] }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: accentColor, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.heading.h5.fontSize, fontWeight: theme.fontWeights.regular, letterSpacing: 2.6, lineHeight: theme.typography.heading.h5.lineHeight }}>{card.title}</Text>
            <Text style={{ color: accentColor, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.heading.h3.fontSize }}>›</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2] }}>
            <Text
              style={{
                color: theme.colors.text.tertiary,
                flex: 1,
                fontSize: theme.typography.body.small.fontSize,
                lineHeight: theme.typography.body.small.lineHeight,
              }}
              numberOfLines={2}
            >
              {getModeDescription(card)}
            </Text>
            <Text color={accentColor} variant="label" style={{ marginLeft: theme.spacing[3], minWidth: theme.spacing[16], textAlign: 'right' }}>{Math.round(card.durationSeconds / 60)} min</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
