import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export function VexFocusSignal(): React.JSX.Element {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <View
      style={{
        borderRadius: theme.borderRadius['2xl'],
        borderWidth: 1,
        borderColor: semantic.liquidGlassBorder,
        backgroundColor: semantic.liquidSignal,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={[semantic.liquidViolet, semantic.liquidGlassClear, semantic.liquidOrange]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />
      <View
        style={{
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[3],
          gap: theme.spacing[1],
        }}
      >
        <Text color="semantic.liquidAmber" fontSize={11} fontWeight="900" letterSpacing={1.4}>
          SECURE FOCUS LINK
        </Text>
        <Text color="semantic.liquidTextSoft" fontSize={13} lineHeight={18}>
          Resume your execution system.
        </Text>
      </View>
    </View>
  );
}

