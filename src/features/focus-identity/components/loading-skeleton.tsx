import React from "react";
import { View } from "react-native";

export function loadingSkeleton(
  spacing: number,
  borderColor: string,
  cardColor: string,
): JSX.Element {
  return (
    <View style={{ gap: spacing }}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={{
            height: spacing * 5,
            borderRadius: spacing,
            borderWidth: 1,
            borderColor,
            backgroundColor: cardColor,
          }}
        />
      ))}
    </View>
  );
}
