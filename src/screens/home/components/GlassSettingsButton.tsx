import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface GlassSettingsButtonProps {
  onPress: () => void;
}

export function GlassSettingsButton({ onPress }: GlassSettingsButtonProps): JSX.Element {
  return (
    <View
      style={{
        borderRadius: 19,
        elevation: 4,
        shadowColor: 'rgba(13, 76, 65, 0.16)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      }}
    >
      <Pressable
        accessibilityHint="Opens app settings"
        accessibilityLabel="Open settings"
        accessibilityRole="button"
        onPress={onPress}
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.36)',
          borderColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 19,
          borderWidth: 1,
          height: 38,
          justifyContent: 'center',
          overflow: 'hidden',
          width: 38,
        }}
      >
        <BlurView
          intensity={34}
          pointerEvents="none"
          tint="light"
          style={{
            borderRadius: 19,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.30)']}
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
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
          name="cog"
          size="sm"
          variant="outline"
        />
      </Pressable>
    </View>
  );
}

export default GlassSettingsButton;
