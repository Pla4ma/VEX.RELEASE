import React from 'react';
import { View } from 'react-native';

export function loadingSkeleton(
  spacing: number,
  _borderColor: string,
  _cardColor: string,
): JSX.Element {
  return (
    <View style={{ gap: spacing }}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.62)',
            borderColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 24,
            borderWidth: 1,
            height: spacing * 5,
          }}
        />
      ))}
    </View>
  );
}
