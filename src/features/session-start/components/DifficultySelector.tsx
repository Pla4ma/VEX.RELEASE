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

import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { useHaptics } from '../../../utils/haptics';
import { eventBus } from '../../../events';
import * as Sentry from '@sentry/react-native';
import { SessionGlyph } from '../../../shared/ui/liquid-glass';
import {
  DIFFICULTY_OPTIONS,
  type DifficultyOption,
  type DifficultySelectorProps,
  type SessionDifficulty,
} from './DifficultySelector.types';

export type { SessionDifficulty };

export function DifficultySelector({
  selected,
  onChange,
  disabled = false,
}: DifficultySelectorProps): JSX.Element {
  const { theme } = useTheme();
  const haptics = useHaptics();

  const handleSelect = (difficulty: SessionDifficulty) => {
    if (disabled) {
      return;
    }
    haptics.light();

    Sentry.addBreadcrumb({
      category: 'session',
      message: 'Difficulty selected',
      data: {
        difficulty,
        xpMultiplier: DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)
          ?.xpMultiplier,
      },
      level: 'info',
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
}: DifficultyCardProps): JSX.Element {
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
    : theme.colors.semantic.surfaceGlass;

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
            shadowColor: theme.colors.semantic.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isSelected ? 0.2 : 0.08,
            shadowRadius: isSelected ? 18 : 10,
          },
        ]}
        accessibilityLabel={`${option.name} difficulty: ${option.pauseLimit} pauses, ${option.xpMultiplier} XP. ${option.description}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <SessionGlyph name={option.glyph} size={48} />

        <Text
          variant="body"
          color={theme.colors.text.primary}
          style={{
            fontWeight: '800',
            marginBottom: theme.spacing[1],
            marginTop: theme.spacing[2],
          }}
        >
          {option.name}
        </Text>

        <View style={{ marginBottom: theme.spacing[2] }}>
          <Text variant="caption" color={theme.colors.text.secondary}>
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
          color={theme.colors.text.tertiary}
          style={{ lineHeight: 17 }}
        >
          {option.description}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
