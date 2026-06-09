import React from 'react';
import { Text, Pressable } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

type Props = {
  userId: string | null;
  streak: number;
  onPress: () => void;
};

export function SimpleWalletBadge({
  userId: _userId,
  streak,
  onPress,
}: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel="Progress badge"
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: lightColors.semantic.background,
      }}
    >
      <Text style={{ color: lightColors.accent.blue, fontSize: 13, fontWeight: '600' }}>
        {streak > 0 ? `Day ${streak}` : 'Start'}
      </Text>
    </Pressable>
  );
}
