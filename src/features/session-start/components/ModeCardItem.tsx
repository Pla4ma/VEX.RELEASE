import React from 'react';
import { Image, Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { isSessionLessMode, SessionMode } from '../../../session/modes';
import type { ModeCard } from './ModeSelector.data';

interface ModeCardItemProps {
  card: ModeCard;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  onPress: () => void;
}

export function ModeCardItem({
  card,
  isSelected,
  isDisabled,
  disabledReason,
  onPress,
}: ModeCardItemProps): React.ReactNode {
  const asset = getModeAsset(card.mode);

  return (
    <Pressable
      key={card.mode}
      accessibilityHint={disabledReason ?? `Selects ${card.name} mode`}
      accessibilityLabel={`${card.name} mode`}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
    >
      <Box
        minHeight={spacing[20] + spacing[4]}
        px="md"
        py="md"
        bg="background.primary"
        borderRadius="xl"
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected
            ? vexFire.ember
            : vexFire.border,
          backgroundColor: isSelected ? vexFire.backgroundRaised : vexFire.panel,
          opacity: isDisabled ? 0.55 : 1,
          shadowColor: vexFire.shadow,
          shadowOffset: { width: 0, height: spacing[2] },
          shadowOpacity: isSelected ? 0.18 : 0.08,
          shadowRadius: isSelected ? spacing[4] : spacing[2],
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={spacing[16]}
            height={spacing[16]}
            borderRadius="lg"
            bg="background.primary"
            alignItems="center"
            justifyContent="center"
            style={{ borderColor: vexFire.line, borderWidth: 1 }}
          >
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={`${card.name} artifact`}
              source={asset}
              resizeMode="contain"
              style={{ height: spacing[12], width: spacing[12] }}
            />
          </Box>
          <Box flex={1}>
            <Text variant="label" color={vexFire.cream}>
              {card.name}
            </Text>
            <Text
              variant="caption"
              color={vexFire.textSecondary}
              style={{ lineHeight: 19 }}
            >
              {disabledReason ?? card.description}
            </Text>
          </Box>
          <Box
            alignItems="center"
            bg="background.primary"
            borderRadius="full"
            px="sm"
            py="xs"
            style={{ borderColor: vexFire.border, borderWidth: 1, backgroundColor: vexFire.backgroundSoft }}
          >
            <Text variant="caption" color={vexFire.textMuted}>
              {isSessionLessMode(card.mode) ? 'No timer' : 'Timer'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

function getModeAsset(mode: ModeCard['mode']): number {
  switch (mode) {
    case SessionMode.STUDY:
      return require('../../../../assets/vex/session/study-mark.png');
    case SessionMode.SPRINT:
      return require('../../../../assets/vex/session/sprint-mark.png');
    case SessionMode.CREATIVE:
    case SessionMode.CAPTURE:
      return require('../../../../assets/vex/home/reflection-relic.png');
    case SessionMode.PLAN:
    case SessionMode.REVIEW:
      return require('../../../../assets/vex/home/progress-instrument.png');
    case SessionMode.HABIT:
      return require('../../../../assets/vex/session/recovery-mark.png');
    case SessionMode.LIGHT_FOCUS:
    case SessionMode.DEEP_WORK:
    default:
      return require('../../../../assets/vex/session/focus-core.png');
  }
}
