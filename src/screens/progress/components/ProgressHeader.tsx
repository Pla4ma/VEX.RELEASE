import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexBrandPill } from '../../home/components/VexBrandPill';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidLens } from '../../../components/glass/LiquidLens';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassBlurLayer } from '../../../components/glass/GlassBlurLayer';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

const { width: SCREEN_W } = Dimensions.get('window');

interface ProgressHeaderProps {
  onOpenNotifications: () => void;
}

export function ProgressHeader({
  onOpenNotifications,
}: ProgressHeaderProps): React.ReactNode {
  return (
    <View style={{ width: '100%', marginBottom: 10, position: 'relative' }}>
      {/* Liquid analytics atmosphere at top of progress screen */}
      <View
        pointerEvents="none"
        style={{
          left: -32,
          opacity: 0.85,
          position: 'absolute',
          top: -42,
          zIndex: 0,
        }}
      >
        <LiquidLens size={160} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          right: -18,
          opacity: 0.85,
          position: 'absolute',
          top: -24,
          zIndex: 0,
        }}
      >
        <WaterBubble opacity={0.65} size={78} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.48,
          opacity: 0.85,
          position: 'absolute',
          top: -14,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={5} opacity={0.65} size={52} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.72,
          opacity: 0.85,
          position: 'absolute',
          top: -6,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={20} intensity={0.62} />
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          zIndex: 2,
        }}
      >
        <VexBrandPill />
        <View
          pointerEvents="none"
          style={{
            opacity: 0.85,
            position: 'absolute',
            right: 42,
            top: 2,
            zIndex: 0,
          }}
        >
          <FloatingDroplets count={2} opacity={0.65} size={18} />
        </View>
        <Pressable
          accessibilityHint="Shows your VEX notifications"
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          onPress={onOpenNotifications}
          style={{
            alignItems: 'center',
            backgroundColor: vexLightGlass.glass.fill,
            borderColor: vexLightGlass.glass.border,
            borderRadius: 19,
            borderWidth: 1,
            height: 38,
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0px 6px 10px vexLightGlass.glass.shadow / 0.85',
            width: 38,
          }}
        >
          <GlassBlurLayer intensity={72} radius={19} />
          <Icon
            color={vexLightGlass.text.primary}
            name="notification"
            size="sm"
            variant="outline"
          />
        </Pressable>
      </View>
      <View style={{ gap: 3, marginBottom: 6, zIndex: 2 }}>
        <Text
          style={{
            color: vexLightGlass.mint[600],
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          Progress
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.6,
            lineHeight: 28,
          }}
        >
          Your focus record.
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
            marginTop: 4,
            fontWeight: '400',
          }}
        >
          Focus sessions, study work, and coaching signals in one place.
        </Text>
      </View>
    </View>
  );
}

export default ProgressHeader;
