import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { SessionMode, isSessionLessMode } from '../../../session/modes';
import { useTheme } from '../../../theme/ThemeContext';
import { SessionGlyph, type SessionGlyphName } from '../../../shared/ui/liquid-glass/SessionGlyphs';
import {
  isFeatureUnlocked,
  type UnlockableFeature,
} from '../../mastery/components/mastery-unlock-gate-data';
import type { MasteryRank } from '../../mastery/types';

export type { SessionMode };

type ModeCard = {
  description: string;
  glyph: SessionGlyphName;
  mode: SessionMode;
  name: string;
};

const FOCUS_MODE_CARDS: ModeCard[] = [
  {
    description: 'High intensity — for hard, uninterrupted work',
    glyph: 'deep',
    mode: SessionMode.DEEP_WORK,
    name: 'Deep Work',
  },
  {
    description: 'Steady, low-pressure — protect a single thread',
    glyph: 'casual',
    mode: SessionMode.LIGHT_FOCUS,
    name: 'Light Focus',
  },
  {
    description: 'Named study blocks with recall and review built in',
    glyph: 'study',
    mode: SessionMode.STUDY,
    name: 'Study',
  },
  {
    description: 'Open-ended creative flow — no pressure, no timers',
    glyph: 'creative',
    mode: SessionMode.CREATIVE,
    name: 'Creative',
  },
  {
    description: 'Short blocks — chain them for momentum',
    glyph: 'sprint',
    mode: SessionMode.SPRINT,
    name: 'Sprint',
  },
];

const SESSIONLESS_MODE_CARDS: ModeCard[] = [
  {
    description: 'Plan your week, projects, and study blocks',
    glyph: 'deep',
    mode: SessionMode.PLAN,
    name: 'Plan',
  },
  {
    description: 'Review your progress and insights',
    glyph: 'casual',
    mode: SessionMode.REVIEW,
    name: 'Review',
  },
  {
    description: 'Quick capture — voice, photo, link, brain dump',
    glyph: 'creative',
    mode: SessionMode.CAPTURE,
    name: 'Capture',
  },
  {
    description: 'Track habits and micro-commitments',
    glyph: 'sprint',
    mode: SessionMode.HABIT,
    name: 'Habit',
  },
];

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

function ModeCardItem({
  card,
  isSelected,
  isDisabled,
  disabledReason,
  onPress,
  theme,
}: {
  card: ModeCard;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}): React.ReactNode {
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
        minHeight={76}
        px="md"
        py="md"
        bg={isSelected ? 'surface.selected' : 'semantic.surfaceGlass'}
        borderRadius={24}
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected
            ? theme.colors.semantic.secondary
            : theme.colors.semantic.liquidGlassBorder,
          opacity: isDisabled ? 0.55 : 1,
          boxShadow: '0px 8px isSelected ? 16 : 10px theme.colors.semantic.shadow / isSelected ? 0.18 : 0.08',
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          <Box
            width={56}
            height={56}
            borderRadius={20}
            bg="semantic.surfaceElevated"
            alignItems="center"
            justifyContent="center"
          >
            <SessionGlyph name={card.glyph} size={44} />
          </Box>
          <Box flex={1}>
            <Text variant="label" color="text.primary">
              {card.name}
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              style={{ lineHeight: 19 }}
            >
              {disabledReason ?? card.description}
            </Text>
          </Box>
          <Box
            alignItems="center"
            bg="semantic.backgroundElevated"
            borderRadius={999}
            px="sm"
            py="xs"
            style={{ borderColor: theme.colors.border.light, borderWidth: 1 }}
          >
            <Text variant="caption" color="text.secondary">
              {isSessionLessMode(card.mode) ? 'No timer' : 'Timer'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

export function ModeSelector({
  hasActiveStudyPlan,
  onModeChange,
  selectedMode,
  userMasteryRank,
  showSessionless = false,
}: ModeSelectorProps): React.ReactNode {
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
