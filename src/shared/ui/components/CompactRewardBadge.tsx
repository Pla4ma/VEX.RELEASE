import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import {
  REWARD_CONFIG,
  getRewardColor,
  type RewardType,
} from './micro-reward-helpers';

export interface CompactRewardBadgeProps {
  type: RewardType;
  amount: number;
  style?: ViewStyle;
}

export const CompactRewardBadge: React.FC<CompactRewardBadgeProps> = ({
  type,
  amount,
  style,
}) => {
  const { theme } = useTheme();
  const color = getRewardColor(type, theme);
  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[1],
          backgroundColor: `${color}15`,
          paddingVertical: theme.spacing[1],
          paddingHorizontal: theme.spacing[2],
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: `${color}30`,
        },
        style,
      ]}
    >
      <Text fontSize={12}>{REWARD_CONFIG[type].icon}</Text>
      <Text variant="caption" color={color} style={{ fontWeight: '700' }}>
        +{amount.toLocaleString()}
      </Text>
    </Animated.View>
  );
};
