import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { SessionMode } from '../../../session/modes';
import { FOCUS_MODE_CARDS, SESSIONLESS_MODE_CARDS, getDisabledReason } from './ModeSelector.data';
import { ModeCardItem } from './ModeCardItem';
import type { MasteryRank } from '../../mastery/types';

export interface ModeSelectorProps {
  hasActiveStudyPlan: boolean;
  onModeChange: (mode: SessionMode) => void;
  selectedMode: SessionMode;
  userMasteryRank?: MasteryRank;
  showSessionless?: boolean;
}

export type { SessionMode } from './ModeSelector.data';

export function ModeSelector({
  hasActiveStudyPlan,
  onModeChange,
  selectedMode,
  userMasteryRank,
  showSessionless = false,
}: ModeSelectorProps): React.ReactNode {
  return (
    <Box gap="sm">
      <Text variant="label" color={vexFire.textSecondary}>
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
            />
          );
        })}
      </Box>

      {showSessionless && (
        <>
          <Text variant="label" color={vexFire.textSecondary} style={{ marginTop: 8 }}>
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
                />
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
