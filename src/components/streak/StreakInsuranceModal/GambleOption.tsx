import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { GambleOptionProps} from './types';
import { GAMBLE_COLORS } from './types';
import { buttonTap } from '../../../utils/haptics';
import {
  gambleOptionStyle,
  gambleBadgeStyle,
  gambleTypeTextStyle,
  gambleContentStyle,
  gambleDescriptionStyle,
  xpBonusStyle,
} from './styles';

export const GambleOption: React.ComponentType<GambleOptionProps> = ({
  type,
  description,
  xpBonus,
  onPress,
  theme,
}) => {
  const color = GAMBLE_COLORS[type](theme);
  return (
    <Pressable
      onPress={() => {
        buttonTap();
        onPress();
      }}
      accessibilityLabel={`${type} gamble: ${description}`}
      accessibilityRole="button"
      accessibilityHint={`Select ${type} gamble option for ${xpBonus} XP bonus`}
      style={({ pressed }) => [
        gambleOptionStyle(theme),
        { borderColor: color },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[gambleBadgeStyle, { backgroundColor: color }]}>
        <Text style={gambleTypeTextStyle(theme)}>{type}</Text>
      </View>
      <View style={gambleContentStyle}>
        <Text style={gambleDescriptionStyle(theme)}>{description}</Text>
        <Text style={[xpBonusStyle, { color }]}>{xpBonus}</Text>
      </View>
    </Pressable>
  );
};
