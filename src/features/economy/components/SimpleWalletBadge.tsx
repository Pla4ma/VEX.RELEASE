import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  userId: string | null;
  streak: number;
  onPress: () => void;
};

export function SimpleWalletBadge({ userId, streak, onPress }: Props): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel="Progress badge"
      accessibilityRole="button"
      onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, backgroundColor: '#1a1a2e' }}
    >
      <Text style={{ color: '#aabbff', fontSize: 13, fontWeight: '600' }}>
        {streak > 0 ? `Day ${streak}` : 'Start'}
      </Text>
    </Pressable>
  );
}
