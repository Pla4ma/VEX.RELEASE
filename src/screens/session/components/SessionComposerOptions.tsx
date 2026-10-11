import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { SessionMode } from '../../../session/modes';
import type { ModeCard } from '../../../features/session-start/components/ModeSelector.data';

function getModeAsset(mode: SessionMode): number {
  switch (mode) {
    case SessionMode.STUDY:
      return require('../../../../assets/vex/session/study-mark.png');
    case SessionMode.CREATIVE:
    case SessionMode.CAPTURE:
      return require('../../../../assets/vex/home/reflection-relic.png');
    case SessionMode.SPRINT:
      return require('../../../../assets/vex/session/sprint-mark.png');
    case SessionMode.PLAN:
    case SessionMode.REVIEW:
      return require('../../../../assets/vex/home/progress-instrument.png');
    case SessionMode.HABIT:
      return require('../../../../assets/vex/session/recovery-mark.png');
    case SessionMode.DEEP_WORK:
    case SessionMode.LIGHT_FOCUS:
    case SessionMode.CHALLENGE:
    case SessionMode.FLOW:
    case SessionMode.RECOVERY:
    case SessionMode.STARTER:
    default:
      return require('../../../../assets/vex/session/focus-core.png');
  }
}

export function SessionModeTile({
  card,
  selected,
  onPress,
}: {
  card: ModeCard;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityHint={`Selects ${card.name} for this session`}
      accessibilityLabel={`${card.name} session mode`}
      accessibilityRole="button"
      onPress={onPress}
      style={{ width: theme.spacing[24] + theme.spacing[8] }}
    >
      <View style={{ alignItems: 'center', backgroundColor: selected ? vexFire.backgroundRaised : vexFire.panel, borderColor: selected ? vexFire.ember : vexFire.border, borderRadius: theme.borderRadius.xl, borderWidth: selected ? 2 : 1, gap: theme.spacing[2], minHeight: theme.spacing[24] + theme.spacing[4], padding: theme.spacing[3] }}>
        <Image accessibilityIgnoresInvertColors accessibilityLabel={`${card.name} artifact`} resizeMode="contain" source={getModeAsset(card.mode)} style={{ height: theme.spacing[12], width: theme.spacing[12] }} />
        <Text color={selected ? vexFire.cream : vexFire.textSecondary} numberOfLines={1} variant="label">{card.name}</Text>
      </View>
    </Pressable>
  );
}

export function SessionPresetChip({
  name,
  duration,
  selected,
  onPress,
}: {
  name: string;
  duration: number;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable accessibilityHint={`Uses the ${name} session preset`} accessibilityLabel={`${name}, ${Math.round(duration / 60)} minutes`} accessibilityRole="button" onPress={onPress} style={{ minHeight: theme.spacing[12] }}>
      <View style={{ alignItems: 'center', backgroundColor: selected ? vexFire.ember : vexFire.panel, borderColor: selected ? vexFire.ember : vexFire.border, borderRadius: theme.borderRadius.full, borderWidth: 1, flexDirection: 'row', gap: theme.spacing[2], minHeight: theme.spacing[12], paddingHorizontal: theme.spacing[4] }}>
        <Text color={selected ? vexFire.background : vexFire.textSecondary} variant="label">{name}</Text>
        <Text color={selected ? vexFire.background : vexFire.textMuted} variant="caption">{Math.round(duration / 60)}m</Text>
      </View>
    </Pressable>
  );
}
