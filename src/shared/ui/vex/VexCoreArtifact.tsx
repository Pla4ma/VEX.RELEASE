import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../../../components/primitives/Text';

interface VexCoreArtifactProps {
  size?: number;
  quiet?: boolean;
}

export function VexCoreArtifact({
  size = 112,
  quiet = false,
}: VexCoreArtifactProps): React.JSX.Element {
  const { theme } = useTheme();
  const coreSize = size * 0.42;
  const ringColor = quiet ? theme.colors.semantic.secondary : theme.colors.primary[500];

  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: 'center',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <View
        style={{
          borderColor: theme.colors.border.strong,
          borderRadius: size * 0.25,
          borderWidth: 1,
          height: size * 0.82,
          position: 'absolute',
          transform: [{ rotate: '45deg' }],
          width: size * 0.82,
        }}
      />
      <View
        style={{
          borderColor: ringColor,
          borderRadius: size * 0.5,
          borderWidth: 1,
          height: size * 0.7,
          position: 'absolute',
          width: size * 0.7,
        }}
      />
      <View
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.surface.button,
          borderColor: ringColor,
          borderRadius: coreSize * 0.5,
          borderWidth: 2,
          height: coreSize,
          justifyContent: 'center',
          width: coreSize,
        }}
      >
        <Text style={{ color: ringColor, fontSize: theme.typography.heading.h4.fontSize, fontWeight: theme.fontWeights.heavy }}>✦</Text>
      </View>
      <View
        style={{
          backgroundColor: ringColor,
          borderRadius: theme.borderRadius.full,
          height: 6,
          position: 'absolute',
          right: size * 0.04,
          top: size * 0.12,
          width: 6,
        }}
      />
    </View>
  );
}
