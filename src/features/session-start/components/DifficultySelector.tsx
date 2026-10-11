/**
 * DifficultySelector Component
 *
 * Three difficulty options for session stakes:
 * - CASUAL: Unlimited pauses, 50% XP
 * - FOCUSED: 2 max pauses, 100% XP (default)
 * - DEEP_WORK: 0 pauses, 150% XP
 *
 * @phase 4
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../../../components/primitives/Text';
import { useHaptics } from '../../../utils/haptics';
import { eventBus } from '../../../events/EventBus';
import { addBreadcrumb } from '../../../config/sentry';
import { SessionGlyph } from '../../../shared/ui/liquid-glass/SessionGlyphs';
import {
  DIFFICULTY_OPTIONS,
  type DifficultyOption,
  type DifficultySelectorProps,
  type SessionDifficulty,
} from './DifficultySelector.types';
import { vexFire } from '../../../theme/tokens/vex-fire';

export type { SessionDifficulty };

export function DifficultySelector({
  selected,
  onChange,
  disabled = false,
}: DifficultySelectorProps): React.ReactNode {
  const { theme } = useTheme();
  const haptics = useHaptics();

  const handleSelect = (difficulty: SessionDifficulty) => {
    if (disabled) {
      return;
    }
    haptics.light();

    addBreadcrumb('Difficulty selected', 'session', {
      difficulty,
      xpMultiplier: DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)
        ?.xpMultiplier,
    });

    eventBus.publish('session:difficulty_selected', {
      difficulty,
      timestamp: Date.now(),
    });

    onChange(difficulty);
  };

  const containerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: theme.spacing[3],
  };

  return (
    <View style={containerStyle}>
      {DIFFICULTY_OPTIONS.map((option) => {
        const isSelected = selected === option.id;

        return (
          <DifficultyCard
            key={option.id}
            option={option}
            isSelected={isSelected}
            disabled={disabled}
            onPress={() => handleSelect(option.id)}
          />
        );
      })}
    </View>
  );
}

interface DifficultyCardProps {
  option: DifficultyOption;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function DifficultyCard({
  option,
  isSelected,
  disabled,
  onPress,
}: DifficultyCardProps): React.ReactNode {
  const { theme } = useTheme();

  const scale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.05 : 1.0, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  const borderColor = isSelected
    ? option.color
    : theme.colors.semantic.liquidGlassBorder;
  const backgroundColor = isSelected
    ? `${option.color}18`
    : vexFire.backgroundRaised;

  return (
    <Animated.View style={[{ flex: 1 }, scale]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          {
            flex: 1,
            minHeight: 178,
            overflow: 'hidden',
            padding: theme.spacing[3],
            borderRadius: theme.borderRadius['2xl'],
            borderWidth: isSelected ? 2 : 1,
            borderColor,
            backgroundColor,
            opacity: disabled ? 0.5 : 1,
            shadowColor: vexFire.shadow,
            shadowOpacity: isSelected ? 0.28 : 0.12,
            shadowRadius: isSelected ? theme.spacing[4] : theme.spacing[2],
            shadowOffset: { width: 0, height: theme.spacing[2] },
            elevation: isSelected ? 5 : 2,
          },
        ]}
accessibilityLabel={`${option.name} difficulty: ${option.pauseLimit} pauses, ${option.xpMultiplier} XP. ${option.description}`}
accessibilityRole="button"
accessibilityHint={`Selects ${option.name} difficulty`}
accessibilityState={{ selected: isSelected }}
>
        <SessionGlyph name={option.glyph} size={48} />

        <Text
          variant="body"
          color={vexFire.cream}
          style={{
            fontWeight: '800',
            marginBottom: theme.spacing[1],
            marginTop: theme.spacing[2],
          }}
        >
          {option.name}
        </Text>

        <View style={{ marginBottom: theme.spacing[2] }}>
          <Text variant="caption" color={vexFire.textSecondary}>
            {option.pauseLimit} pauses
          </Text>
          <Text
            variant="caption"
            color={option.color}
            style={{ fontWeight: '600' }}
          >
            {option.xpMultiplier} XP
          </Text>
        </View>

        <Text
          variant="caption"
          color={vexFire.textMuted}
          style={{ lineHeight: 17 }}
        >
          {option.description}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
