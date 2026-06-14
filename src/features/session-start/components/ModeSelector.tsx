import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { SessionMode, isSessionLessMode } from '@/session/modes';
import { useTheme } from '@/theme';
import { SessionGlyph, type SessionGlyphName } from '@/shared/ui/liquid-glass';
import {
  isFeatureUnlocked,
  type UnlockableFeature,
} from '@/features/mastery/components/mastery-unlock-gate-data';
import type { MasteryRank } from '@/features/mastery/types';
import { FOCUS_MODE_CARDS, SESSIONLESS_MODE_CARDS } from './ModeSelector.data';
import { ModeCardItem } from './ModeCardItem';

export type { SessionMode };

export interface ModeSelectorProps {
  hasActiveStudyPlan: boolean;
  onModeChange: (mode: SessionMode) => void;
  selectedMode: SessionMode;
  userMasteryRank?: MasteryRank;
  showSessionless?: boolean;
}

function getDisabledReason(
  mode: SessionMode,
  hasActiveStudyPlan: boolean,
  userMasteryRank?: MasteryRank,
): string | null {
  if (mode === SessionMode.STUDY && !hasActiveStudyPlan) {
    return 'Requires an active study plan';
  }

  if (mode === SessionMode.DEEP_WORK && userMasteryRank) {
    const isUnlocked = isFeatureUnlocked(
      userMasteryRank,
      'DEEP_WORK' as UnlockableFeature,
    );
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
  showSessionless = false,
}: ModeSelectorProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <Box gap="sm">
      <Text variant="label" color="text.secondary">
        Session Type
      </Text>

      <Box gap="sm">
        {FOCUS_MODE_CARDS.map((card) => {
          const disabledReason = getDisabledReason(
            card.mode,
            hasActiveStudyPlan,
            userMasteryRank,
          );
          const isSelected = selectedMode === card.mode;
          const isDisabled = disabledReason !== null;

          return (
            <ModeCardItem
              key={card.mode}
              card={card}
              isSelected={isSelected}
              isDisabled={isDisabled}
              disabledReason={disabledReason}
              onPress={() => onModeChange(card.mode)}
              theme={theme}
            />
          );
        })}
      </Box>

      {showSessionless && (
        <>
          <Text variant="label" color="text.secondary" style={{ marginTop: 8 }}>
            Session-less
          </Text>
          <Box gap="sm">
            {SESSIONLESS_MODE_CARDS.map((card) => {
              const isSelected = selectedMode === card.mode;

              return (
                <ModeCardItem
                  key={card.mode}
                  card={card}
                  isSelected={isSelected}
                  isDisabled={false}
                  disabledReason={null}
                  onPress={() => onModeChange(card.mode)}
                  theme={theme}
                />
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

export default ModeSelector;