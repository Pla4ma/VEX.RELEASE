import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../icons/components/Icon';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassPill } from '../../../components/glass/GlassPill';
import { VexBrandPill } from '../components/VexBrandPill';
import { borderRadius } from '../../../theme/tokens/radius';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import type { ExtendedRootStackParams } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

        
export function HomeTopBar(): React.ReactNode {
  const navigation = useNavigation<Nav>();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[5],
        zIndex: 2,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          left: -6,
          opacity: 0.7,
          position: 'absolute',
          top: -2,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.55} size={18} spread={28} />
      </View>
      <View style={{ zIndex: 3 }}>
        <VexBrandPill />
      </View>
      <View style={{ zIndex: 3 }}>
        <GlassPill
          label="Project mode"
          rightIcon={
            <Icon
              color={vexLightGlass.mint[700]}
              name="chevronDown"
              size="xs"
              variant="solid"
            />
          }
          size="sm"
          variant="mint"
        />
      </View>
      <Pressable
        accessibilityHint="Shows your VEX notifications"
        accessibilityLabel="Open notifications"
        accessibilityRole="button"
        onPress={() => navigation.navigate('Notifications')}
        style={{
          alignItems: 'center',
          backgroundColor: vexLightGlass.glass.fill,
          borderColor: vexLightGlass.glass.border,
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          height: 44,
          justifyContent: 'center',
          overflow: 'hidden',
          shadowColor: vexLightGlass.glass.shadow,
          shadowOffset: { height: 7, width: 0 },
          shadowOpacity: 0.16,
          shadowRadius: 12,
          width: 44,
          zIndex: 3,
          ...getMinTouchTargetStyle(),
        }}
      >
        <LinearGradient
          colors={[
            vexLightGlass.glass.innerHighlight,
            vexLightGlass.glass.fillSubtle,
          ]}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.55]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            height: '60%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          pointerEvents="none"
          style={{}}
        />
        <Icon
          color={vexLightGlass.text.primary}
          name="notification"
          size="sm"
          variant="outline"
        />
      </Pressable>
    </View>
  );
}
