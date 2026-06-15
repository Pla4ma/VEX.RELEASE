import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { LiquidLens } from '../../../components/glass/LiquidLens';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassBlurLayer } from '../../../components/glass/GlassBlurLayer';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScreenHeaderProps {
  onSettingsPress?: () => void;
  body?: string;
}

export function FocusScreenHeader({ onSettingsPress, body }: FocusScreenHeaderProps): React.ReactNode {
  return (
    <View style={{ marginBottom: 10, paddingTop: 8, width: '100%' }}>
      <View pointerEvents="none" style={{ opacity: 0.5, position: 'absolute', right: -32, top: -28, zIndex: 0 }}>
        <LiquidLens size={140} opacity={0.58} />
      </View>
      <View pointerEvents="none" style={{ opacity: 0.48, position: 'absolute', right: 48, top: -12, zIndex: 0 }}>
        <FloatingDroplets count={5} opacity={0.48} size={52} />
      </View>
      <View pointerEvents="none" style={{ opacity: 0.45, position: 'absolute', right: 12, top: 8, zIndex: 0 }}>
        <WaterBubble size={28} opacity={0.5} />
      </View>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ color: vexLightGlass.text.primary, fontSize: 18, fontWeight: '700', letterSpacing: 4 }}>
          VEX
        </Text>
        {onSettingsPress ? (
          <Pressable
            accessibilityHint="Open VEX settings"
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={onSettingsPress}
            style={{
              alignItems: 'center',
              backgroundColor: vexLightGlass.glass.fill,
              borderColor: vexLightGlass.glass.border,
              borderRadius: 19,
              borderWidth: 1.5,
              height: 40,
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0px 7px 12px vexLightGlass.glass.shadow / 0.85',
              width: 40,
            }}
          >
            <GlassBlurLayer intensity={72} radius={19} />
            <LinearGradient
              colors={[vexLightGlass.glass.innerHighlight, vexLightGlass.glass.fillSubtle]}
              end={{ x: 0, y: 1 }}
              locations={[0, 0.55]}
              start={{ x: 0, y: 0 }}
              style={{ borderTopLeftRadius: 19, borderTopRightRadius: 19, height: '62%', left: 0, position: 'absolute', right: 0, top: 0 }}
            />
            <View pointerEvents="none" style={{ backgroundColor: vexLightGlass.glass.innerHighlight, borderTopLeftRadius: 21, borderTopRightRadius: 21, height: 1.5, left: 8, position: 'absolute', right: 8, top: 1.2 }} />
            <Icon color={vexLightGlass.text.primary} name="gear" size="sm" variant="outline" />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 5, marginBottom: 8 }}>
        <Text style={{ color: vexLightGlass.text.primary, fontSize: 25, fontWeight: '800', letterSpacing: 0, lineHeight: 31 }}>
          Focus modes
        </Text>
        <Text style={{ color: vexLightGlass.text.secondary, fontSize: 14, fontWeight: '600', letterSpacing: 0, lineHeight: 20 }}>
          Choose the shape of this block
        </Text>
        {body ? (
          <Text style={{ color: vexLightGlass.text.tertiary, fontSize: 13, fontWeight: '400', lineHeight: 18, marginTop: 4 }}>
            {body}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default FocusScreenHeader;
