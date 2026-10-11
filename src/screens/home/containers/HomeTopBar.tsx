import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { useTheme } from '../../../theme/ThemeContext';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToRootScreen } from '../../../navigation/navigation-helpers';
import { vexFire } from '../../../theme/tokens/vex-fire';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function HomeTopBar(): React.ReactNode {
  const navigation = useNavigation<Nav>();
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: theme.spacing[12],
        position: 'relative',
        zIndex: 2,
      }}
    >
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2] }}>
        <View
          style={{
            backgroundColor: vexFire.ember,
            borderRadius: theme.borderRadius.full,
            height: 7,
            width: 7,
          }}
        />
        <Text
          style={{
            color: vexFire.ember,
            fontFamily: theme.fonts.display ?? theme.fonts.primary,
            fontSize: theme.typography.heading.h2.fontSize,
            fontWeight: theme.fontWeights.regular,
            letterSpacing: -0.8,
          }}
        >
          VEX
        </Text>
      </View>
      <Pressable
        accessibilityHint="Shows your VEX notifications"
        accessibilityLabel="Open VEX ritual guide"
        accessibilityRole="button"
        onPress={() => navigateToRootScreen(navigation, 'Guide')}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed ? vexFire.backgroundSoft : 'transparent',
          borderColor: vexFire.borderStrong,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          justifyContent: 'center',
          ...getMinTouchTargetStyle(),
        })}
      >
        <VexIcon color={vexFire.ember} name="sparkles" size="sm" variant="outline" />
      </Pressable>
    </View>
  );
}
