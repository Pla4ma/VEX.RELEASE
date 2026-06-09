import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface NotificationButtonProps {
  onPress: () => void;
}

export function NotificationButton({ onPress }: NotificationButtonProps): JSX.Element {
  return (
    <Pressable
      accessibilityHint="Shows your VEX notifications"
      accessibilityLabel="Open notifications"
      accessibilityRole="button"
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.42)',
        borderColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 19,
        borderWidth: 1,
        height: 38,
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: 'rgba(13, 76, 65, 0.16)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        width: 38,
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
  );
}
