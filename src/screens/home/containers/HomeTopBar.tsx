import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../icons';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassPill } from '../../../components/glass/GlassPill';
import { VexBrandPill } from '../components/VexBrandPill';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { ExtendedRootStackParams } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function HomeTopBar(): JSX.Element {
  const navigation = useNavigation<Nav>();

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        zIndex: 2,
      }}
    >
      <VexBrandPill />
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
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 44,
          top: 2,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={2} opacity={0.65} size={20} />
      </View>
      <Pressable
        accessibilityHint="Shows your VEX notifications"
        accessibilityLabel="Open notifications"
        accessibilityRole="button"
        onPress={() => navigation.navigate('Notifications')}
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.52)',
          borderColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 19,
          borderWidth: 1.5,
          height: 40,
          justifyContent: 'center',
          overflow: 'hidden',
          shadowColor: 'rgba(13, 76, 65, 0.18)',
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.85,
          shadowRadius: 12,
          width: 40,
        }}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.32)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.55]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
            height: '60%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderTopLeftRadius: 21,
            borderTopRightRadius: 21,
            height: 1,
            left: 8,
            position: 'absolute',
            right: 8,
            top: 1,
          }}
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
