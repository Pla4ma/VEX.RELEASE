import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface GlassSettingsButtonProps {
  onPress: () => void;
}

        const elementStyle_52 = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderTopLeftRadius: 21,
  borderTopRightRadius: 21,
  height: 1.5,
  left: 8,
  position: 'absolute',
  right: 8,
  top: 1.2,
};
export function GlassSettingsButton({ onPress }: GlassSettingsButtonProps): React.ReactNode {
  return (
    <View
      style={{
        borderRadius: 19,
        boxShadow: `0px 6px 10px rgba(13, 76, 65, 0.136)`,
      }}
    >
      <Pressable
        accessibilityHint="Opens app settings"
        accessibilityLabel="Open settings"
        accessibilityRole="button"
        onPress={onPress}
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.48)',
          borderColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 19,
          borderWidth: 1.5,
          height: 40,
          justifyContent: 'center',
          overflow: 'hidden',
          width: 40,
        }}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0.38)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.55]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
            height: '62%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View
          pointerEvents="none"
          style={elementStyle_52}
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