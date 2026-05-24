import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { SessionMode, SESSION_MODE_CONFIG } from '../../../session/modes';
import { useTheme } from '../../../theme';
import { isFeatureUnlocked, type UnlockableFeature } from '../../mastery/components/MasteryUnlockGate';
import type { MasteryRank } from '../../mastery/types';

export type { SessionMode };

type ModeCard = {
  description: string;
  icon: string;
  mode: SessionMode;
  name: string;
};

const MODE_CARDS: ModeCard[] = [
  {
    description: 'Boss 1.5x - No mercy for distractions',
    icon: 'BRAIN',
    mode: SessionMode.DEEP_WORK,
    name: 'Deep Work',
  },
  {
    description: 'Perfect for streak maintenance',
    icon: 'LEAF',
    mode: SessionMode.LIGHT_FOCUS,
    name: 'Light Focus',
  },
  {
    description: 'Study plan linked - earn quiz bonuses',
    icon: 'BOOK',
    mode: SessionMode.STUDY,
    name: 'Study',
  },
  {
    description: 'Log your mood. Express freely.',
    icon: 'PALETTE',
    mode: SessionMode.CREATIVE,
    name: 'Creative',
  },
  {
    description: '25-min blocks. Chain them for increasing XP.',
    icon: 'BOLT',
    mode: SessionMode.SPRINT,
    name: 'Sprint',
  },
];

export interface ModeSelectorProps {
  hasActiveStudyPlan: boolean;
  onModeChange: (mode: SessionMode) => void;
  selectedMode: SessionMode;
  userMasteryRank?: MasteryRank;
}

function getDisabledReason(
  mode: SessionMode,
  hasActiveStudyPlan: boolean,
  userMasteryRank?: MasteryRank
): string | null {
  if (mode === SessionMode.STUDY && !hasActiveStudyPlan) {
    return 'Requires an active study plan';
  }

  if (mode === SessionMode.DEEP_WORK && userMasteryRank) {
    const isUnlocked = isFeatureUnlocked(userMasteryRank, 'DEEP_WORK' as UnlockableFeature);
    if (!isUnlocked) {
      return 'Unlocks at Adept mastery rank';
    }
  }

  return null;
}

export function ModeSelector({
  hasActiveStudyPlan,
  onModeChange,
  selectedMode,
  userMasteryRank,
}: ModeSelectorProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="label" color="text.secondary">
        SESSION TYPE
      </Text>

      <Box gap="sm">
        {MODE_CARDS.map((card) => {
          const config = SESSION_MODE_CONFIG[card.mode];
          const disabledReason = getDisabledReason(card.mode, hasActiveStudyPlan, userMasteryRank);
          const isSelected = selectedMode === card.mode;
          const isDisabled = disabledReason !== null;

          return (
            <Pressable
              key={card.mode}
              accessibilityHint={disabledReason ?? `Selects ${card.name} session rules`}
              accessibilityLabel={`${card.name} mode`}
              accessibilityRole="button"
              disabled={isDisabled}
              onPress={() => onModeChange(card.mode)}
            >
              <Box
                minHeight={76}
                px="md"
                py="sm"
                bg={isSelected ? 'background.elevated' : 'background.secondary'}
                borderRadius="lg"
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.light,
                  opacity: isDisabled ? 0.55 : 1,
                }}
              >
                <Box flexDirection="row" alignItems="center" gap="md">
                  <Box width={44} height={44} borderRadius="lg" bg="background.tertiary" alignItems="center" justifyContent="center">
                    <Text variant="label" color="primary.500">
                      {card.icon}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <Text variant="label" color="text.primary">
                      {card.name}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      {disabledReason ?? card.description}
                    </Text>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text variant="caption" color="primary.500">
                      {`${config.xpMultiplier.toFixed(2)}x XP`}
                    </Text>
                    <Text variant="caption" color="text.secondary">
                      {`${config.bossDamageMultiplier.toFixed(2)}x boss`}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
}

export default ModeSelector;
