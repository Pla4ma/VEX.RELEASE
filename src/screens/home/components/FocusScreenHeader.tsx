import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { LiquidLens } from '../../../components/glass/LiquidLens';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassBlurLayer } from '../../../components/glass/GlassBlurLayer';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScreenHeaderProps {
  onSettingsPress?: () => void;
  body?: string;
}

export function FocusScreenHeader({ onSettingsPress, body }: FocusScreenHeaderProps): JSX.Element {
  return (
    <View style={{ marginBottom: 6, width: '100%' }}>
      {/* Cinematic liquid atmosphere – top-right, away from text */}
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: -32,
          top: -28,
          zIndex: 0,
        }}
      >
        <LiquidLens size={140} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 48,
          top: -12,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={5} opacity={0.65} size={52} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 12,
          top: 8,
          zIndex: 0,
        }}
      >
        <WaterBubble size={28} opacity={0.65} />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View />
        {onSettingsPress ? (
          <Pressable
            accessibilityHint="Open VEX settings"
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={onSettingsPress}
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
            <GlassBlurLayer intensity={72} radius={19} />
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
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderTopLeftRadius: 21,
                borderTopRightRadius: 21,
                height: 1.5,
                left: 8,
                position: 'absolute',
                right: 8,
                top: 1.2,
              }}
            />
            <Icon
              color={vexLightGlass.text.primary}
              name="gear"
              size="sm"
              variant="outline"
            />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 4, marginBottom: 6 }}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.6,
            lineHeight: 28,
          }}
        >
          Focus modes
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 14,
            fontWeight: '500',
            letterSpacing: -0.2,
            lineHeight: 20,
          }}
        >
          Choose the shape of this block
        </Text>
        {body ? (
          <Text
            style={{
              color: vexLightGlass.text.tertiary,
              fontSize: 13,
              lineHeight: 18,
              fontWeight: '400',
              marginTop: 4,
            }}
          >
            {body}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default FocusScreenHeader;
